<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\CinturaQuadril;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Sex-specific risk cutoffs per WHO, Waist Circumference and Waist-Hip Ratio, 2008:
 * risco aumentado se RCQ > 0.90 (homens) ou > 0.85 (mulheres).
 */
final class CinturaQuadrilClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $value = $result['value'];
        $cutoff = $inputs['sex'] === 'male' ? 0.90 : 0.85;

        return $value > $cutoff ? 'risco_aumentado' : 'risco_normal';
    }
}
