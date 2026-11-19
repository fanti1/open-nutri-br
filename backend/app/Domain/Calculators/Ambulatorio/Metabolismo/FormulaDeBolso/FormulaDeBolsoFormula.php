<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\FormulaDeBolso;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * GET = peso(kg) × fator (20–35 kcal/kg conforme objetivo clínico).
 * Faixas de referência: diretrizes da ESPEN (UTI 2019, polimórbidos 2018, geriatria 2019).
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
