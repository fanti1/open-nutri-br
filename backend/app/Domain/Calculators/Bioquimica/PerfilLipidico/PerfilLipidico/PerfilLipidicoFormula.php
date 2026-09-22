<?php

namespace App\Domain\Calculators\Bioquimica\PerfilLipidico\PerfilLipidico;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * LDL-c (Friedewald) = CT − HDL-c − TG/5, válida só com TG < 400 mg/dL
 * (acima disso o LDL não é estimado e fica de fora do resultado).
 * Não-HDL-c = CT − HDL-c.
 * Reference: Friedewald WT, Levy RI, Fredrickson DS, Clin Chem, 1972.
 */
final class PerfilLipidicoFormula implements FormulaInterface
{
    public const FRIEDEWALD_MAX_TG = 400;

    public function compute(array $inputs): array
    {
        $total = (float) $inputs['total_cholesterol_mg_dl'];
        $hdl = (float) $inputs['hdl_mg_dl'];
        $triglycerides = (float) $inputs['triglycerides_mg_dl'];

        $values = [];

        if ($triglycerides < self::FRIEDEWALD_MAX_TG) {
            $values['ldl_mg_dl'] = round($total - $hdl - $triglycerides / 5, 2);
        }

        $values['non_hdl_mg_dl'] = round($total - $hdl, 2);

        return $values;
    }
}
