<?php

namespace App\Domain\Calculators\Hospitalar\GastoEnergetico\Toronto;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Fórmula de Toronto (queimados):
 * GER = −4343 + 10,5·%SCQ + 0,23·ingestão calórica + 0,84·Harris-Benedict
 *       + 114·T (°C) − 4,5·dias pós-queimadura
 * Reference: Allard JP et al., JPEN, 1990.
 */
final class TorontoFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $ree = -4343
            + 10.5 * (float) $inputs['burned_body_surface_percent']
            + 0.23 * (float) $inputs['caloric_intake_kcal']
            + 0.84 * (float) $inputs['harris_benedict_kcal']
            + 114 * (float) $inputs['temperature_c']
            - 4.5 * (float) $inputs['post_burn_day'];

        return ['ree_kcal' => round($ree, 2)];
    }
}
