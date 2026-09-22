<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Must;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** 0 = risco baixo; 1 = risco médio; ≥2 = risco alto. BAPEN, 2003. */
final class MustClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match (true) {
            $result['total_score'] <= 0 => 'risco_baixo',
            $result['total_score'] == 1 => 'risco_medio',
            default => 'risco_alto',
        };
    }
}
