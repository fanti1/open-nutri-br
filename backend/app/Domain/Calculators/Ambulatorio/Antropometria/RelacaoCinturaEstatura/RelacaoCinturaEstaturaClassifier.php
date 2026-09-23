<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\RelacaoCinturaEstatura;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Adiposidade central (NICE NG246, 2025), para adultos com IMC < 35:
 * < 0,5 saudável · 0,5–0,59 aumentada · ≥ 0,6 alta.
 */
final class RelacaoCinturaEstaturaClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match (true) {
            $result['waist_height_ratio'] >= 0.6 => 'adiposidade_central_alta',
            $result['waist_height_ratio'] >= 0.5 => 'adiposidade_central_aumentada',
            default => 'adiposidade_central_saudavel',
        };
    }
}
