<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\IngestaoLiquidos;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * 30–35 mL/kg/dia (adulto).
 * Reference: ESPEN Guideline on Home Enteral Nutrition.
 */
final class IngestaoLiquidosFormula implements FormulaInterface
{
    private const MIN_ML_PER_KG = 30;

    private const MAX_ML_PER_KG = 35;

    public function compute(array $inputs): array
    {
        $weightKg = (float) $inputs['weight_kg'];

        return [
            'min_ml_per_day' => round($weightKg * self::MIN_ML_PER_KG, 2),
            'max_ml_per_day' => round($weightKg * self::MAX_ML_PER_KG, 2),
        ];
    }
}
