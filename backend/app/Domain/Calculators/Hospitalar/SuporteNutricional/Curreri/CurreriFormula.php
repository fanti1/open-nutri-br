<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\Curreri;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * kcal = 25×peso(kg) + 40×%SCQ (superfície corporal queimada).
 * Reference: Curreri PW et al., Dietary requirements of patients with major
 * burns, J Trauma, 1974.
 */
final class CurreriFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $weightKg = (float) $inputs['weight_kg'];
        $burnedSurfacePercent = (float) $inputs['burned_body_surface_percent'];

        return ['get_kcal' => round(25 * $weightKg + 40 * $burnedSurfacePercent, 2)];
    }
}
