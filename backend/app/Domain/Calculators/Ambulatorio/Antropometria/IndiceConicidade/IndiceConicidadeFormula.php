<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\IndiceConicidade;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Índice de conicidade = cintura (m) / (0,109 × √(peso (kg) / estatura (m))).
 * Reference: Valdez R, A simple model-based index of abdominal adiposity,
 * J Clin Epidemiol, 1991.
 */
final class IndiceConicidadeFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $waistM = (float) $inputs['waist_cm'] / 100;
        $heightM = (float) $inputs['height_cm'] / 100;
        $weightKg = (float) $inputs['weight_kg'];

        return ['conicity_index' => round($waistM / (0.109 * sqrt($weightKg / $heightM)), 2)];
    }
}
