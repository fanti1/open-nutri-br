<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\AnemiaOms;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Support\Cutoff;

/** Sem anemia / leve / moderada / grave pelos cortes da OMS (2024), sobre a hemoglobina ajustada quando houver ajuste. */
final class AnemiaOmsClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        [$none, $mild, $moderate] = AnemiaCutoffs::for($inputs);
        $hemoglobin = $result['adjusted_hemoglobin_g_dl'] ?? $result['hemoglobin_g_dl'];

        return match (true) {
            Cutoff::reaches($hemoglobin, $none) => 'sem_anemia',
            Cutoff::reaches($hemoglobin, $mild) => 'anemia_leve',
            Cutoff::reaches($hemoglobin, $moderate) => 'anemia_moderada',
            default => 'anemia_grave',
        };
    }
}
