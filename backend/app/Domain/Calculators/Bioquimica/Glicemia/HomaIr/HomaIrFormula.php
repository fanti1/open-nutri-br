<?php

namespace App\Domain\Calculators\Bioquimica\Glicemia\HomaIr;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * HOMA-IR = glicemia de jejum (mg/dL) × insulina de jejum (µUI/mL) / 405
 * (equivalente a mmol/L × µUI/mL / 22,5).
 * Reference: Matthews DR et al., Diabetologia, 1985.
 */
final class HomaIrFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $glucose = (float) $inputs['fasting_glucose_mg_dl'];
        $insulin = (float) $inputs['fasting_insulin_uui_ml'];

        return ['homa_ir' => round($glucose * $insulin / 405, 2)];
    }
}
