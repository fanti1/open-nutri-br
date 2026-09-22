<?php

namespace App\Domain\Calculators\Bioquimica\FuncaoRenal\CockcroftGault;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Clearance de creatinina (mL/min) = (140 − idade) × peso(kg) / (72 × Scr)
 * × 0,85 se mulher. Não é indexado à superfície corporal.
 * Reference: Cockcroft DW, Gault MH, Nephron, 1976.
 */
final class CockcroftGaultFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $age = (float) $inputs['age_years'];
        $weight = (float) $inputs['weight_kg'];
        $creatinine = (float) $inputs['creatinine_mg_dl'];

        $clearance = (140 - $age) * $weight / (72 * $creatinine);

        if ($inputs['sex'] === 'female') {
            $clearance *= 0.85;
        }

        return ['crcl_ml_min' => round($clearance, 2)];
    }
}
