<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\FerritinaOms;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** Ferritina abaixo do corte da OMS (2020) indica deficiência de ferro. */
final class FerritinaOmsClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return $result['ferritin_ng_ml'] < $result['ferritin_cutoff_ng_ml']
            ? 'deficiencia_de_ferro'
            : 'sem_deficiencia_de_ferro';
    }
}
