<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\HollidaySegar;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * 100 mL/kg para os primeiros 10 kg + 50 mL/kg para os próximos 10 kg +
 * 20 mL/kg para o restante do peso.
 * Reference: Holliday MA, Segar WE, The maintenance need for water in
 * parenteral fluid therapy, Pediatrics, 1957.
 */
final class HollidaySegarFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $weightKg = (float) $inputs['weight_kg'];

        $ml = match (true) {
            $weightKg <= 10 => $weightKg * 100,
            $weightKg <= 20 => 1000 + ($weightKg - 10) * 50,
            default => 1500 + ($weightKg - 20) * 20,
        };

        return ['ml_per_day' => round($ml, 2)];
    }
}
