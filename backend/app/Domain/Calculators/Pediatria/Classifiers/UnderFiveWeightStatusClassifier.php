<?php

namespace App\Domain\Calculators\Pediatria\Classifiers;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Peso-para-comprimento/estatura e IMC-para-idade em menores de 5 anos
 * (mesmos pontos de corte para os dois indicadores nessa faixa).
 * Reference: Ministério da Saúde, Norma Técnica do SISVAN, 2011.
 */
final class UnderFiveWeightStatusClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $z = $result['z_score'];

        return match (true) {
            $z < -3 => 'magreza_acentuada',
            $z < -2 => 'magreza',
            $z <= 1 => 'eutrofia',
            $z <= 2 => 'risco_de_sobrepeso',
            $z <= 3 => 'sobrepeso',
            default => 'obesidade',
        };
    }
}
