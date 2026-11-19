<?php

namespace App\Domain\Calculators\Pediatria\Support;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Growth\Contracts\GrowthReferenceRepository;
use App\Domain\Growth\OutOfReferenceRangeException;
use App\Domain\Growth\WhoZScore;
use Closure;

/**
 * Escore-Z da Referência de Crescimento OMS 2007 (5 a 19 anos): idade em
 * meses com interpolação linear dos parâmetros LMS entre meses inteiros, como
 * em zscore_indicator() do pacote oficial `anthroplus`.
 * Reference: de Onis M et al., Development of a WHO growth reference for
 * school-aged children and adolescents, Bull World Health Organ, 2007.
 */
final class Who2007IndicatorFormula implements FormulaInterface
{
    private const MIN_MONTHS = 60;

    /**
     * @param  Closure(array<string, mixed>): float  $measure
     * @param  int|null  $lastRowUntilExclusive  Idade (meses) até a qual a última linha da tabela
     *                                           continua valendo — a Norma Técnica do SISVAN (2011,
     *                                           Quadro 13) manda avaliar de 19 anos e 1 mês a 19 anos
     *                                           e 11 meses com os valores de 19 anos completos.
     */
    public function __construct(
        private readonly GrowthReferenceRepository $reference,
        private readonly string $table,
        private readonly bool $restrictedZScore,
        private readonly int $maxMonthsExclusive,
        private readonly Closure $measure,
        private readonly ?int $lastRowUntilExclusive = null,
    ) {}

    public function compute(array $inputs): array
    {
        $ageMonths = (float) $inputs['age_months'];
        $upperExclusive = $this->lastRowUntilExclusive ?? $this->maxMonthsExclusive;

        if ($ageMonths < self::MIN_MONTHS || $ageMonths >= $upperExclusive) {
            throw new OutOfReferenceRangeException(sprintf(
                'Esta curva da Referência OMS 2007 cobre de %d a %d meses.',
                self::MIN_MONTHS,
                $upperExclusive - 1,
            ));
        }

        $lastRow = $this->maxMonthsExclusive - 1;
        $lookupAge = $this->lastRowUntilExclusive !== null ? min($ageMonths, $lastRow) : $ageMonths;

        $lms = $this->reference->interpolated($this->table, PediatricInputs::whoSex($inputs), $lookupAge, 1);

        if ($lms === null) {
            throw new OutOfReferenceRangeException('Idade fora da faixa da curva de referência.');
        }

        $y = ($this->measure)($inputs);
        $z = $this->restrictedZScore ? WhoZScore::computeAdjusted($y, $lms) : WhoZScore::compute($y, $lms);

        return [
            'z_score' => round($z, 2),
            'measure' => round($y, 2),
            'reference_median' => round($lms->m, 2),
        ];
    }
}
