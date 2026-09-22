<?php

namespace App\Domain\Calculators\Bioquimica\FuncaoRenal\CkdEpi2021;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * CKD-EPI 2021 (creatinina, sem coeficiente de raça):
 * TFGe = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1,200 × 0,9938^idade × 1,012 [mulher]
 * κ = 0,7 (mulher) / 0,9 (homem); α = −0,241 (mulher) / −0,302 (homem).
 * Resultado em mL/min/1,73 m².
 * Reference: Inker LA et al., N Engl J Med, 2021.
 */
final class CkdEpi2021Formula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $creatinine = (float) $inputs['creatinine_mg_dl'];
        $age = (float) $inputs['age_years'];
        $female = $inputs['sex'] === 'female';

        $kappa = $female ? 0.7 : 0.9;
        $alpha = $female ? -0.241 : -0.302;
        $ratio = $creatinine / $kappa;

        $egfr = 142
            * min($ratio, 1) ** $alpha
            * max($ratio, 1) ** -1.200
            * 0.9938 ** $age
            * ($female ? 1.012 : 1.0);

        return ['egfr_ml_min_173m2' => round($egfr, 2)];
    }
}
