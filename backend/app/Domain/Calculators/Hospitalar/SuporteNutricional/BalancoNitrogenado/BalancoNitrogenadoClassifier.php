<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\BalancoNitrogenado;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** Positivo = anabolismo; negativo = catabolismo. Blackburn et al., 1977. */
final class BalancoNitrogenadoClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match (true) {
            $result['balance_g_per_day'] > 0 => 'balanco_positivo',
            $result['balance_g_per_day'] < 0 => 'balanco_negativo',
            default => 'balanco_neutro',
        };
    }
}
