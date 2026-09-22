<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\HarrisBenedict;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Harris-Benedict revisado (Roza & Shizgal, 1984) — revisão da equação original
 * de Harris & Benedict (1919).
 * Homens: 88.362 + 13.397×peso + 4.799×altura(cm) − 5.677×idade
 * Mulheres: 447.593 + 9.247×peso + 3.098×altura(cm) − 4.330×idade
 * Reference: Roza AM, Shizgal HM, Am J Clin Nutr, 1984.
 */
final class HarrisBenedictFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $weightKg = (float) $inputs['weight_kg'];
        $heightCm = (float) $inputs['height_cm'];
        $age = (float) $inputs['age_years'];

        $bmr = $inputs['sex'] === 'male'
            ? 88.362 + (13.397 * $weightKg) + (4.799 * $heightCm) - (5.677 * $age)
            : 447.593 + (9.247 * $weightKg) + (3.098 * $heightCm) - (4.330 * $age);

        return [
            'bmr_kcal' => round($bmr, 2),
        ];
    }
}
