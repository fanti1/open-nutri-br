<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\AsgDetsky;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/** A classificação é a que o avaliador atribuiu (A, B ou C): na ASG ela é julgamento global, não conta. Detsky et al., 1987. */
final class AsgDetskyClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match ($inputs['global_rating']) {
            'A' => 'bem_nutrido',
            'B' => 'moderadamente_desnutrido_ou_suspeita',
            'C' => 'gravemente_desnutrido',
        };
    }
}
