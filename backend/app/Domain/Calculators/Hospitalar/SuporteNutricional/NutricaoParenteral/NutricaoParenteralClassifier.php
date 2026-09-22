<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\NutricaoParenteral;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** Faixa recomendada 100-150:1 (adultos). ASPEN/BRASPEN Guidelines. */
final class NutricaoParenteralClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match (true) {
            $result['kcal_per_gram_nitrogen'] < 100 => 'abaixo_da_faixa_recomendada',
            $result['kcal_per_gram_nitrogen'] <= 150 => 'dentro_da_faixa_recomendada',
            default => 'acima_da_faixa_recomendada',
        };
    }
}
