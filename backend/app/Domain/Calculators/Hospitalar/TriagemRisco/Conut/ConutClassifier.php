<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Conut;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** 0-1 normal; 2-4 leve; 5-8 moderada; 9-12 grave. Ignacio de Ulíbarri et al., 2005. */
final class ConutClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match (true) {
            $result['total_score'] <= 1 => 'normal',
            $result['total_score'] <= 4 => 'desnutricao_leve',
            $result['total_score'] <= 8 => 'desnutricao_moderada',
            default => 'desnutricao_grave',
        };
    }
}
