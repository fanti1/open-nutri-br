<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Glim;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** Diagnóstico só se fenotípico E etiológico presentes; gravidade = pior fenotípico. Cederholm et al., 2019. */
final class GlimClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        if ($result['phenotypic_severity'] == 0 || $result['etiologic_criteria_met'] == 0) {
            return 'sem_desnutricao';
        }

        return $result['phenotypic_severity'] >= 2 ? 'desnutricao_grave' : 'desnutricao_moderada';
    }
}
