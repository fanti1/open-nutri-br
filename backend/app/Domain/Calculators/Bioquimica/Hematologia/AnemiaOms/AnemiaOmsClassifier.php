<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\AnemiaOms;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** Sem anemia / leve / moderada / grave pelos cortes da OMS (2011) do grupo do paciente. */
final class AnemiaOmsClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        [$none, $mild, $moderate] = AnemiaCutoffs::for((float) $inputs['age_years'], $inputs['sex'], (bool) $inputs['pregnant']);
        $hemoglobin = $result['hemoglobin_g_dl'];

        return match (true) {
            $hemoglobin >= $none => 'sem_anemia',
            $hemoglobin >= $mild => 'anemia_leve',
            $hemoglobin >= $moderate => 'anemia_moderada',
            default => 'anemia_grave',
        };
    }
}
