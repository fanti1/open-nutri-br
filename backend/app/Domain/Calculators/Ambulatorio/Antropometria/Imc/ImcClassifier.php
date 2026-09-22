<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\Imc;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Classification bands per WHO Technical Report Series 894, 2000.
 */
final class ImcClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $value = $result['value'];

        return match (true) {
            $value < 18.5 => 'baixo_peso',
            $value < 25.0 => 'eutrofia',
            $value < 30.0 => 'sobrepeso',
            default => 'obesidade',
        };
    }
}
