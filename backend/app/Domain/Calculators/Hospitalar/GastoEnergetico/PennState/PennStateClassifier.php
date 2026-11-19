<?php

namespace App\Domain\Calculators\Hospitalar\GastoEnergetico\PennState;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Informa qual versão da equação foi aplicada — o profissional precisa saber
 * qual valor está vendo. Usa o mesmo IMC (sem arredondar) que a fórmula: com
 * IMC 29,997 a fórmula aplica a 2003b, e o IMC exibido (30,00) não pode fazer
 * o rótulo dizer 2010.
 */
final class PennStateClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return PennStateFormula::usesOlderObeseVersion((float) $inputs['age_years'], PennStateFormula::bmi($inputs))
            ? 'equacao_2010_idoso_com_obesidade'
            : 'equacao_2003b';
    }
}
