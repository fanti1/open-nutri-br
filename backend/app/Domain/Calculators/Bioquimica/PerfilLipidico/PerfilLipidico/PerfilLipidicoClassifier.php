<?php

namespace App\Domain\Calculators\Bioquimica\PerfilLipidico\PerfilLipidico;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Valores referenciais desejáveis para adultos (SBC, 2017): CT < 190 mg/dL,
 * HDL-c > 40 mg/dL e TG < 150 mg/dL em jejum (< 175 mg/dL sem jejum).
 * As metas de LDL-c e não-HDL-c dependem da categoria de risco cardiovascular,
 * que este cálculo não avalia.
 */
final class PerfilLipidicoClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $triglyceridesLimit = (bool) $inputs['fasting'] ? 150 : 175;

        $desirable = (float) $inputs['total_cholesterol_mg_dl'] < 190
            && (float) $inputs['hdl_mg_dl'] > 40
            && (float) $inputs['triglycerides_mg_dl'] < $triglyceridesLimit;

        return $desirable ? 'perfil_desejavel' : 'perfil_alterado';
    }
}
