<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Must;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * MUST soma 3 subescores (0-2 cada): IMC, % de perda de peso não intencional
 * (3-6 meses) e efeito de doença aguda sem ingestão por >5 dias.
 * Reference: BAPEN / Malnutrition Advisory Group, MUST, 2003.
 */
final class MustFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $bmi = $inputs['weight_kg'] / ($inputs['height_m'] ** 2);
        $weightLossPercent = (float) $inputs['weight_loss_percent'];
        $acuteDiseaseEffect = (bool) $inputs['acute_disease_effect'];

        $bmiScore = match (true) {
            $bmi > 20.0 => 0,
            $bmi >= 18.5 => 1,
            default => 2,
        };

        $weightLossScore = match (true) {
            $weightLossPercent < 5.0 => 0,
            $weightLossPercent <= 10.0 => 1,
            default => 2,
        };

        $diseaseScore = $acuteDiseaseEffect ? 2 : 0;

        return ['total_score' => (float) ($bmiScore + $weightLossScore + $diseaseScore)];
    }
}
