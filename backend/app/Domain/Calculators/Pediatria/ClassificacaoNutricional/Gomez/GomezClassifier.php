<?php

namespace App\Domain\Calculators\Pediatria\ClassificacaoNutricional\Gomez;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** ≥90% sem desnutrição; 75–89,9% 1º grau; 60–74,9% 2º grau; <60% 3º grau. Gómez et al., 1956. */
final class GomezClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $percent = $result['percent_of_median'];

        return match (true) {
            $percent >= 90 => 'sem_desnutricao',
            $percent >= 75 => 'desnutricao_primeiro_grau',
            $percent >= 60 => 'desnutricao_segundo_grau',
            default => 'desnutricao_terceiro_grau',
        };
    }
}
