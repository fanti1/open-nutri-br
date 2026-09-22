<?php

namespace App\Domain\Calculators\Pediatria\Classifiers;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Comprimento/estatura-para-idade (0 a 19 anos).
 * Reference: Ministério da Saúde, Norma Técnica do SISVAN, 2011.
 */
final class HeightForAgeClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $z = $result['z_score'];

        return match (true) {
            $z < -3 => 'muito_baixa_estatura_para_idade',
            $z < -2 => 'baixa_estatura_para_idade',
            default => 'estatura_adequada_para_idade',
        };
    }
}
