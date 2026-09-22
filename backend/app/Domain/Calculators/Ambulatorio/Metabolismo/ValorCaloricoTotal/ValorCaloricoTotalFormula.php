<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\ValorCaloricoTotal;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * VCT = TMB × fator de atividade.
 * Fatores de atividade conforme FAO/WHO/UNU, Human Energy Requirements, 2001.
 */
final class ValorCaloricoTotalFormula implements FormulaInterface
{
    public const ACTIVITY_FACTORS = [
        'sedentario' => 1.2,
        'leve' => 1.375,
        'moderado' => 1.55,
        'intenso' => 1.725,
        'muito_intenso' => 1.9,
    ];

    public function compute(array $inputs): array
    {
        $bmrKcal = (float) $inputs['bmr_kcal'];
        $factor = self::ACTIVITY_FACTORS[$inputs['activity_level']];

        return [
            'vct_kcal' => round($bmrKcal * $factor, 2),
        ];
    }
}
