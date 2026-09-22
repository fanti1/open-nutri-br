<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\MNutric;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** ≥5 (de 0-9) = alto risco nutricional em UTI. Rahman et al., 2016. */
final class MNutricClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return $result['total_score'] >= 5 ? 'alto_risco_nutricional' : 'baixo_risco_nutricional';
    }
}
