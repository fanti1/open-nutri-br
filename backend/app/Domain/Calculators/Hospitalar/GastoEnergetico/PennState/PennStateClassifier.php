<?php

namespace App\Domain\Calculators\Hospitalar\GastoEnergetico\PennState;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** Informa qual versão da equação foi aplicada — o profissional precisa saber qual valor está vendo. */
final class PennStateClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return PennStateFormula::usesOlderObeseVersion((float) $inputs['age_years'], $result['bmi'])
            ? 'equacao_2010_idoso_com_obesidade'
            : 'equacao_2003b';
    }
}
