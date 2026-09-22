<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\AnemiaOms;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Hemoglobina informada e o ponto de corte da OMS para o grupo do paciente
 * (idade, sexo e gestação).
 * Reference: WHO, Haemoglobin concentrations for the diagnosis of anaemia, 2011.
 */
final class AnemiaOmsFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        [$cutoff] = AnemiaCutoffs::for((float) $inputs['age_years'], $inputs['sex'], (bool) $inputs['pregnant']);

        return [
            'hemoglobin_g_dl' => (float) $inputs['hemoglobin_g_dl'],
            'anemia_cutoff_g_dl' => $cutoff,
        ];
    }
}
