<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\AnemiaOms;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Hemoglobina informada, o ajuste pela altitude e pelo tabagismo (quando
 * houver) e o ponto de corte da OMS para o grupo do paciente (idade, sexo e
 * trimestre da gestação).
 * Reference: WHO, Guideline on haemoglobin cutoffs to define anaemia in
 * individuals and populations, 2024.
 */
final class AnemiaOmsFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $hemoglobin = (float) $inputs['hemoglobin_g_dl'];
        $adjustment = AnemiaCutoffs::adjustment($inputs);
        $values = ['hemoglobin_g_dl' => $hemoglobin];

        if ($adjustment > 0) {
            $values['hemoglobin_adjustment_g_dl'] = $adjustment;
            $values['adjusted_hemoglobin_g_dl'] = round($hemoglobin - $adjustment, 2);
        }

        [$cutoff] = AnemiaCutoffs::for($inputs);
        $values['anemia_cutoff_g_dl'] = $cutoff;

        return $values;
    }
}
