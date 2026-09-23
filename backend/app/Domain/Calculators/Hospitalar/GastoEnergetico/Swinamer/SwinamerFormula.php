<?php

namespace App\Domain\Calculators\Hospitalar\GastoEnergetico\Swinamer;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * GE (kcal/dia) = 945·SC − 6,4·idade + 108·T + 24,2·f + 817·VC − 4349
 * SC = superfície corporal (m²), T = temperatura (°C), f = frequência
 * respiratória (irpm), VC = volume corrente (L).
 * Reference: Swinamer DL et al., Crit Care Med, 1990.
 */
final class SwinamerFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $ree = 945 * (float) $inputs['body_surface_area_m2']
            - 6.4 * (float) $inputs['age_years']
            + 108 * (float) $inputs['temperature_c']
            + 24.2 * (float) $inputs['respiratory_rate']
            + 817 * (float) $inputs['tidal_volume_l']
            - 4349;

        return ['ree_kcal' => round($ree, 2)];
    }
}
