<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\PesoIdeal;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Devine formula (1974). Height is converted from meters to inches because the
 * original equation was published in imperial units.
 * Homens: 50 + 2.3 × (altura_pol − 60)
 * Mulheres: 45.5 + 2.3 × (altura_pol − 60)
 * Reference: Devine BJ, Drug Intell Clin Pharm, 1974.
 */
final class PesoIdealFormula implements FormulaInterface
{
    private const INCHES_PER_METER = 39.3701;

    public function compute(array $inputs): array
    {
        $heightIn = (float) $inputs['height_m'] * self::INCHES_PER_METER;
        $extraInches = max(0.0, $heightIn - 60);

        $baseKg = $inputs['sex'] === 'male' ? 50.0 : 45.5;

        return [
            'value' => round($baseKg + 2.3 * $extraInches, 2),
        ];
    }
}
