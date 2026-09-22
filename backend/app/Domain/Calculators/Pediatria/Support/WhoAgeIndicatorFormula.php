<?php

namespace App\Domain\Calculators\Pediatria\Support;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Growth\Contracts\GrowthReferenceRepository;
use App\Domain\Growth\OutOfReferenceRangeException;
use App\Domain\Growth\WhoMeasurements;
use App\Domain\Growth\WhoZScore;
use Closure;

/**
 * Escore-Z de um indicador-por-idade dos Padrões de Crescimento OMS 2006
 * (0 a < 60 meses): idade convertida para dias e buscada exatamente na tabela,
 * como em anthro_zscore_adjusted() do pacote oficial.
 * Reference: WHO Child Growth Standards, 2006.
 */
final class WhoAgeIndicatorFormula implements FormulaInterface
{
    /**
     * @param  Closure(array<string, mixed>): float  $measure
     */
    public function __construct(
        private readonly GrowthReferenceRepository $reference,
        private readonly string $table,
        private readonly bool $restrictedZScore,
        private readonly Closure $measure,
    ) {}

    public function compute(array $inputs): array
    {
        $ageMonths = (float) $inputs['age_months'];

        if ($ageMonths >= 60) {
            throw new OutOfReferenceRangeException('Os Padrões de Crescimento OMS 2006 cobrem de 0 a 59 meses. Use a referência OMS 2007 (5 a 19 anos).');
        }

        $lms = $this->reference->exact($this->table, PediatricInputs::whoSex($inputs), WhoMeasurements::ageInDays($ageMonths));

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
