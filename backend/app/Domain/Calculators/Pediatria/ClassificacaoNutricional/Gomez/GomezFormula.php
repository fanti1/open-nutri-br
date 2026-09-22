<?php

namespace App\Domain\Calculators\Pediatria\ClassificacaoNutricional\Gomez;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Growth\Contracts\GrowthReferenceRepository;
use App\Domain\Growth\OutOfReferenceRangeException;
use App\Domain\Growth\WhoMeasurements;

/**
 * % de adequação do peso-para-idade = peso / mediana de referência × 100.
 * Mediana tomada dos Padrões OMS 2006 (a publicação original usava as
 * referências da época; a prática atual usa a OMS).
 * Reference: Gómez F et al., Mortality in second and third degree malnutrition, J Trop Pediatr, 1956.
 */
final class GomezFormula implements FormulaInterface
{
    public function __construct(
        private readonly GrowthReferenceRepository $reference,
    ) {}

    public function compute(array $inputs): array
    {
        $ageMonths = (float) $inputs['age_months'];

        $lms = $ageMonths < 60
            ? $this->reference->exact('weianthro', PediatricInputs::whoSex($inputs), WhoMeasurements::ageInDays($ageMonths))
            : null;

        if ($lms === null) {
            throw new OutOfReferenceRangeException('A classificação de Gomez com mediana OMS 2006 se aplica de 0 a 59 meses.');
        }

        return [
            'percent_of_median' => round((float) $inputs['weight_kg'] / $lms->m * 100, 2),
            'reference_median' => round($lms->m, 2),
        ];
    }
}
