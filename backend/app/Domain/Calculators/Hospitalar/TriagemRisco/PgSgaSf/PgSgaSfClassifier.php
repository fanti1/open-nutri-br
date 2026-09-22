<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\PgSgaSf;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** 0-1 sem necessidade; 2-3 educação; 4-8 intervenção por nutricionista; ≥9 crítica. Ottery, 1996. */
final class PgSgaSfClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match (true) {
            $result['total_score'] <= 1 => 'sem_necessidade_intervencao',
            $result['total_score'] <= 3 => 'educacao_nutricional',
            $result['total_score'] <= 8 => 'intervencao_por_nutricionista',
            default => 'intervencao_critica_urgente',
        };
    }
}
