<?php

namespace App\Domain\Calculators\Pediatria\Classifiers;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Peso-para-idade (0 a 10 anos).
 * Reference: Ministério da Saúde, Orientações para a coleta e análise de dados
 * antropométricos em serviços de saúde — Norma Técnica do SISVAN, 2011.
 */
final class WeightForAgeClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $z = $result['z_score'];

        return match (true) {
            $z < -3 => 'muito_baixo_peso_para_idade',
            $z < -2 => 'baixo_peso_para_idade',
            $z <= 2 => 'peso_adequado_para_idade',
            default => 'peso_elevado_para_idade',
        };
    }
}
