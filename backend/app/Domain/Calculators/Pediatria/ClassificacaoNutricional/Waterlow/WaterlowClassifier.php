<?php

namespace App\Domain\Calculators\Pediatria\ClassificacaoNutricional\Waterlow;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Cruzamento peso/estatura (corte 90%) × estatura/idade (corte 95%):
 * eutrofia, desnutrição atual (aguda), crônica ou pregressa.
 * Reference: Waterlow JC, BMJ, 1972.
 */
final class WaterlowClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $wastedNow = $result['weight_for_height_percent'] < 90;
        $stunted = $result['height_for_age_percent'] < 95;

        return match (true) {
            ! $wastedNow && ! $stunted => 'eutrofia',
            $wastedNow && ! $stunted => 'desnutricao_atual',
            $wastedNow && $stunted => 'desnutricao_cronica',
            default => 'desnutricao_pregressa',
        };
    }
}
