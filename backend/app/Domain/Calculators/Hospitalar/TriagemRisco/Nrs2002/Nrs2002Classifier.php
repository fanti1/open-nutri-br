<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Nrs2002;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** Score ≥3 = risco nutricional (indica plano de cuidado nutricional). Kondrup et al., 2003. */
final class Nrs2002Classifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return $result['total_score'] >= 3 ? 'risco_nutricional' : 'sem_risco_atual';
    }
}
