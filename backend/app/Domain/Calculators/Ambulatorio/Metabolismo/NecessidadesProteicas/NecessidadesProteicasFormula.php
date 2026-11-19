<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\NecessidadesProteicas;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Proteína (g/dia) = peso × g/kg/dia escolhido pelo profissional. As
 * recomendações conferidas (ESPEN: 1,3 g/kg na UTI; ≥ 1,0 g/kg em polimórbidos
 * e em idosos) aparecem como orientação no formulário; nenhuma é imposta.
 */
final class NecessidadesProteicasFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        return [
            'protein_g_per_day' => round((float) $inputs['weight_kg'] * (float) $inputs['protein_g_per_kg'], 2),
        ];
    }
}
