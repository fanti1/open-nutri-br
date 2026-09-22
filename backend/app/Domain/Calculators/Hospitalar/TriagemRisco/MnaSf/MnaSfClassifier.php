<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\MnaSf;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** ≥12 normal; 8-11 risco de desnutrição; ≤7 desnutrido. Rubenstein et al., 2001. */
final class MnaSfClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match (true) {
            $result['total_score'] >= 12 => 'estado_nutricional_normal',
            $result['total_score'] >= 8 => 'risco_de_desnutricao',
            default => 'desnutrido',
        };
    }
}
