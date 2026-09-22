<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\CinturaQuadril;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * RCQ = circunferência da cintura / circunferência do quadril
 * Reference: WHO, Waist Circumference and Waist-Hip Ratio: Report of a WHO
 * Expert Consultation, 2008.
 */
final class CinturaQuadrilFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $waistCm = (float) $inputs['waist_cm'];
        $hipCm = (float) $inputs['hip_cm'];

        return [
            'value' => round($waistCm / $hipCm, 2),
        ];
    }
}
