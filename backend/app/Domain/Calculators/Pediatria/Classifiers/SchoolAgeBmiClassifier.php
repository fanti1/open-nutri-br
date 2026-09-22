<?php

namespace App\Domain\Calculators\Pediatria\Classifiers;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * IMC-para-idade de 5 a 19 anos (crianças de 5–10 e adolescentes usam os mesmos cortes).
 * Reference: Ministério da Saúde, Norma Técnica do SISVAN, 2011.
 */
final class SchoolAgeBmiClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $z = $result['z_score'];

        return match (true) {
            $z < -3 => 'magreza_acentuada',
            $z < -2 => 'magreza',
            $z <= 1 => 'eutrofia',
            $z <= 2 => 'sobrepeso',
            $z <= 3 => 'obesidade',
            default => 'obesidade_grave',
        };
    }
}
