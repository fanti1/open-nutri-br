<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\FormulaDeBolso;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * GET = peso(kg) × fator (20–35 kcal/kg conforme objetivo clínico).
 * Reference: ASPEN Clinical Guidelines, McClave SA et al., JPEN, 2016.
 */
final class FormulaDeBolsoFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $weightKg = (float) $inputs['weight_kg'];
        $factor = (float) $inputs['factor_kcal_per_kg'];

        return [
            'get_kcal' => round($weightKg * $factor, 2),
        ];
    }
}
