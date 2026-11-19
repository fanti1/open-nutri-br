<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\IngestaoLiquidos;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Líquidos (mL/dia) = peso × mL/kg/dia escolhido pelo profissional. A
 * recomendação conferida para idosos (ESPEN, 2019: pelo menos 1,6 L/dia de
 * bebidas para mulheres e 2,0 L/dia para homens) aparece como orientação.
 */
final class IngestaoLiquidosFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        return [
            'ml_per_day' => round((float) $inputs['weight_kg'] * (float) $inputs['ml_per_kg'], 2),
        ];
    }
}
