<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\DietaEnteral;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Taxa de infusão (mL/h) = volume-alvo(mL) / duração da infusão(h).
 * Reference: ASPEN/BRASPEN Guidelines for Enteral Nutrition.
 */
final class DietaEnteralFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $targetVolumeMl = (float) $inputs['target_volume_ml'];
        $infusionDurationHours = (float) $inputs['infusion_duration_hours'];

        return ['rate_ml_per_hour' => round($targetVolumeMl / $infusionDurationHours, 2)];
    }
}
