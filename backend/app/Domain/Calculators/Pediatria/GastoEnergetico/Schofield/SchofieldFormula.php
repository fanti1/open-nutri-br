<?php

namespace App\Domain\Calculators\Pediatria\GastoEnergetico\Schofield;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * TMB (kcal/dia) = a × peso(kg) + b, com coeficientes por sexo e faixa etária.
 * Coeficientes conferidos na Tabela 5.2 de FAO/WHO/UNU, Human Energy
 * Requirements, 2004 (que reproduz Schofield, 1985).
 * Reference: Schofield WN, Predicting basal metabolic rate, new standards and
 * review of previous work, Hum Nutr Clin Nutr, 1985.
 */
final class SchofieldFormula implements FormulaInterface
{
    /** [idade mínima (anos, inclusiva), a, b] em ordem crescente de idade. */
    private const COEFFICIENTS = [
        'male' => [
            [0, 59.512, -30.4],
            [3, 22.706, 504.3],
            [10, 17.686, 658.2],
            [18, 15.057, 692.2],
            [30, 11.472, 873.1],
            [60, 11.711, 587.7],
        ],
        'female' => [
            [0, 58.317, -31.1],
            [3, 20.315, 485.9],
            [10, 13.384, 692.6],
            [18, 14.818, 486.6],
            [30, 8.126, 845.6],
            [60, 9.082, 658.5],
        ],
    ];

    public function compute(array $inputs): array
    {
        $age = (float) $inputs['age_years'];
        $weightKg = (float) $inputs['weight_kg'];

        [, $a, $b] = collect(self::COEFFICIENTS[$inputs['sex']])
            ->last(fn (array $band) => $age >= $band[0]);

        return ['bmr_kcal' => round($a * $weightKg + $b, 2)];
    }
}
