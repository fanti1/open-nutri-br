<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\RelacaoCinturaEstatura;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Adiposidade central (NICE NG246, 2025, recomendação 1.9.11), para adultos
 * com IMC < 35: 0,4–0,49 saudável · 0,5–0,59 aumentada · ≥ 0,6 alta. Abaixo
 * de 0,4 a NICE não classifica — o resultado não é chamado de "saudável".
 */
final class RelacaoCinturaEstaturaClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        return match (true) {
            $result['waist_height_ratio'] >= 0.6 => 'adiposidade_central_alta',
            $result['waist_height_ratio'] >= 0.5 => 'adiposidade_central_aumentada',
            $result['waist_height_ratio'] >= 0.4 => 'adiposidade_central_saudavel',
            default => 'abaixo_da_faixa_de_referencia',
        };
    }
}
