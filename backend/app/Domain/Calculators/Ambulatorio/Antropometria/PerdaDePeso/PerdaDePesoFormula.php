<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\PerdaDePeso;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * % Perda de Peso = ((peso habitual − peso atual) / peso habitual) × 100
 * Reference: Blackburn GL et al., Nutritional and metabolic assessment of the
 * hospitalized patient, JPEN, 1977.
 */
final class PerdaDePesoFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $usualKg = (float) $inputs['usual_weight_kg'];
        $currentKg = (float) $inputs['current_weight_kg'];

        return [
            'percentage' => round((($usualKg - $currentKg) / $usualKg) * 100, 2),
        ];
    }
}
