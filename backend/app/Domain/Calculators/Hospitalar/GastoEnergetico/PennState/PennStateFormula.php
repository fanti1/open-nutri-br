<?php

namespace App\Domain\Calculators\Hospitalar\GastoEnergetico\PennState;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Gasto energético de repouso em pacientes críticos sob ventilação mecânica.
 * Mifflin-St Jeor com peso atual; Ve em L/min; Tmax = temperatura máxima nas
 * últimas 24 h (°C).
 *   2003b: 0,96·Mifflin + 31·Ve + 167·Tmax − 6212
 *   2010 (≥ 60 anos e IMC ≥ 30): 0,71·Mifflin + 85·Tmax + 64·Ve − 3085
 * Reference: Frankenfield D et al., JPEN 2004 e 2009; Frankenfield D, JPEN 2011.
 */
final class PennStateFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $weight = (float) $inputs['weight_kg'];
        $heightCm = (float) $inputs['height_cm'];
        $age = (float) $inputs['age_years'];
        $ve = (float) $inputs['minute_ventilation_l_min'];
        $tmax = (float) $inputs['max_temperature_c'];

        $mifflin = 10 * $weight + 6.25 * $heightCm - 5 * $age + ($inputs['sex'] === 'male' ? 5 : -161);
        $bmi = $weight / ($heightCm / 100) ** 2;

        $ree = self::usesOlderObeseVersion($age, $bmi)
            ? 0.71 * $mifflin + 85 * $tmax + 64 * $ve - 3085
            : 0.96 * $mifflin + 31 * $ve + 167 * $tmax - 6212;

        return [
            'ree_kcal' => round($ree, 2),
            'mifflin_kcal' => round($mifflin, 2),
            'bmi' => round($bmi, 2),
        ];
    }

    /** A versão 2010 foi validada para ≥ 60 anos com IMC ≥ 30 (Frankenfield, 2011). */
    public static function usesOlderObeseVersion(float $age, float $bmi): bool
    {
        return $age >= 60 && $bmi >= 30;
    }
}
