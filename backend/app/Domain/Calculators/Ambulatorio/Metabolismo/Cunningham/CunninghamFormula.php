<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\Cunningham;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * TMB (kcal/dia) = 500 + 22 × massa magra (kg), com massa magra =
 * peso × (1 − % gordura / 100).
 * Reference: Cunningham JJ, Am J Clin Nutr, 1980.
 */
final class CunninghamFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $leanMass = (float) $inputs['weight_kg'] * (1 - (float) $inputs['body_fat_percent'] / 100);

        return [
            'bmr_kcal' => round(500 + 22 * $leanMass, 2),
            'lean_mass_kg' => round($leanMass, 2),
        ];
    }
}
