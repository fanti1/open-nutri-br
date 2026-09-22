<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\AsgDetsky;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** Categoria com mais domínios; empate desempatado a favor da mais grave (C>B>A). Detsky et al., 1987. */
final class AsgDetskyClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $max = max($result['count_a'], $result['count_b'], $result['count_c']);

        return match (true) {
            $result['count_c'] == $max => 'gravemente_desnutrido',
            $result['count_b'] == $max => 'moderadamente_desnutrido_ou_suspeita',
            default => 'bem_nutrido',
        };
    }
}
