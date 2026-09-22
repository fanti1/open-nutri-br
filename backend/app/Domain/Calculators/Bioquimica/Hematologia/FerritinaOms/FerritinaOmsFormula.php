<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\FerritinaOms;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Ferritina informada e o ponto de corte da OMS para deficiência de ferro:
 * < 5 anos: 12 µg/L (saudável) ou 30 µg/L (com infecção/inflamação);
 * ≥ 5 anos: 15 µg/L (saudável) ou 70 µg/L (com infecção/inflamação).
 * Reference: WHO guideline on use of ferritin concentrations to assess iron
 * status in individuals and populations, 2020.
 */
final class FerritinaOmsFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $underFive = (float) $inputs['age_years'] < 5;
        $inflammation = (bool) $inputs['inflammation'];

        $cutoff = match (true) {
            $underFive && $inflammation => 30.0,
            $underFive => 12.0,
            $inflammation => 70.0,
            default => 15.0,
        };

        return [
            'ferritin_ng_ml' => (float) $inputs['ferritin_ng_ml'],
            'ferritin_cutoff_ng_ml' => $cutoff,
        ];
    }
}
