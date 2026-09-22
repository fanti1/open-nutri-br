<?php

namespace App\Domain\Calculators\Pediatria\ClassificacaoNutricional\Waterlow;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Calculators\Pediatria\Support\WeightForLengthReference;
use App\Domain\Growth\Contracts\GrowthReferenceRepository;
use App\Domain\Growth\OutOfReferenceRangeException;
use App\Domain\Growth\WhoMeasurements;

/**
 * % de adequação do peso-para-estatura (déficit atual/agudo) e da
 * estatura-para-idade (déficit crônico), com medianas dos Padrões OMS 2006.
 * Reference: Waterlow JC, Classification and definition of protein-calorie malnutrition, BMJ, 1972.
 */
final class WaterlowFormula implements FormulaInterface
{
    public function __construct(
        private readonly GrowthReferenceRepository $reference,
        private readonly WeightForLengthReference $weightForLength,
    ) {}

    public function compute(array $inputs): array
    {
        $ageMonths = (float) $inputs['age_months'];

        if ($ageMonths >= 60) {
            throw new OutOfReferenceRangeException('A classificação de Waterlow com medianas OMS 2006 se aplica de 0 a 59 meses.');
        }

        $length = PediatricInputs::standardizedLength($inputs);
        $heightForAge = $this->reference->exact('lenanthro', PediatricInputs::whoSex($inputs), WhoMeasurements::ageInDays($ageMonths))
            ?? throw new OutOfReferenceRangeException('Idade fora da faixa da curva de referência.');
        $weightForHeight = $this->weightForLength->lmsFor($inputs);

        return [
            'weight_for_height_percent' => round((float) $inputs['weight_kg'] / $weightForHeight->m * 100, 2),
            'height_for_age_percent' => round($length / $heightForAge->m * 100, 2),
        ];
    }
}
