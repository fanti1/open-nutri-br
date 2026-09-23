<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\IndiceConicidade;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Pontos de corte para risco coronariano elevado em adultos brasileiros
 * (30–74 anos): 1,25 homens · 1,18 mulheres.
 * Reference: Pitanga FJG, Lessa I, Rev Bras Epidemiol, 2004.
 */
final class IndiceConicidadeClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $cutoff = $inputs['sex'] === 'male' ? 1.25 : 1.18;

        return $result['conicity_index'] >= $cutoff ? 'risco_coronariano_elevado' : 'sem_risco_coronariano_elevado';
    }
}
