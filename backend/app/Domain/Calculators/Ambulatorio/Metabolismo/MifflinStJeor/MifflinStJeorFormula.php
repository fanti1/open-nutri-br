<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\MifflinStJeor;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Homens: 10×peso + 6.25×altura(cm) − 5×idade + 5
 * Mulheres: 10×peso + 6.25×altura(cm) − 5×idade − 161
 * Reference: Mifflin MD et al., Am J Clin Nutr, 1990 — recomendada pela Academy
 * of Nutrition and Dietetics como a equação preditiva mais precisa para adultos.
 */
final class MifflinStJeorFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $weightKg = (float) $inputs['weight_kg'];
        $heightCm = (float) $inputs['height_cm'];
        $age = (float) $inputs['age_years'];

        $base = (10 * $weightKg) + (6.25 * $heightCm) - (5 * $age);
        $bmr = $inputs['sex'] === 'male' ? $base + 5 : $base - 161;

        return [
            'bmr_kcal' => round($bmr, 2),
        ];
    }
}
