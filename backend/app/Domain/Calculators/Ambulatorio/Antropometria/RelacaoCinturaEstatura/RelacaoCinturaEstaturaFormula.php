<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\RelacaoCinturaEstatura;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Relação cintura-estatura = circunferência da cintura (cm) / estatura (cm).
 * Reference: Ashwell M, Gunn P, Gibson S, Obes Rev, 2012.
 */
final class RelacaoCinturaEstaturaFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        return ['waist_height_ratio' => round((float) $inputs['waist_cm'] / (float) $inputs['height_cm'], 2)];
    }
}
