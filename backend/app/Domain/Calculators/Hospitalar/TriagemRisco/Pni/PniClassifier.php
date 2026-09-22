<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Pni;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** <30% risco baixo; 30-59% intermediário; ≥60% risco alto de complicações. Buzby et al., 1980. */
final class PniClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match (true) {
            $result['pni_percent'] < 30 => 'risco_baixo',
            $result['pni_percent'] < 60 => 'risco_intermediario',
            default => 'risco_alto',
        };
    }
}
