<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\CinturaQuadril;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Support\Cutoff;

/**
 * Risco substancialmente aumentado se RCQ ≥ 0,90 (homens) ou ≥ 0,85 (mulheres):
 * WHO, Waist Circumference and Waist-Hip Ratio, 2008, Tabela A1.
 */
final class CinturaQuadrilClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $value = $result['value'];
        $cutoff = $inputs['sex'] === 'male' ? 0.90 : 0.85;

        return Cutoff::reaches($value, $cutoff) ? 'risco_aumentado' : 'risco_normal';
    }
}
