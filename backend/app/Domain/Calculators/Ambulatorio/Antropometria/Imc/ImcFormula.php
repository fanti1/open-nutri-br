<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\Imc;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * IMC = peso(kg) / altura(m)^2
 * Reference: WHO Technical Report Series 894, 2000.
 */
final class ImcFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $weightKg = (float) $inputs['weight_kg'];
        $heightM = (float) $inputs['height_m'];

        return [
            'value' => round($weightKg / ($heightM ** 2), 2),
        ];
    }
}
