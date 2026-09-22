<?php

namespace App\Domain\Calculators\Pediatria\Classifiers;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Perímetro cefálico-para-idade: microcefalia < −2 DP, grave < −3 DP;
 * macrocefalia > +2 DP.
 * Reference: WHO, Screening, assessment and management of neonates and infants
 * with complications associated with Zika virus exposure in utero, 2016.
 */
final class HeadCircumferenceClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $z = $result['z_score'];

        return match (true) {
            $z < -3 => 'microcefalia_grave',
            $z < -2 => 'microcefalia',
            $z <= 2 => 'adequado_para_idade',
            default => 'macrocefalia',
        };
    }
}
