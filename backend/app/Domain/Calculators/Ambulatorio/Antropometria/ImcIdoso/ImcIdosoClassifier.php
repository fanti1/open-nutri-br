<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\ImcIdoso;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * IMC do idoso (≥ 60 anos), como no SISVAN: ≤ 22,0 baixo peso; > 22,0 e
 * < 27,0 peso adequado; ≥ 27,0 sobrepeso. Os cortes são mais altos que os do
 * adulto por causa da perda de massa magra e estatura no envelhecimento.
 * Reference: Lipschitz DA, Screening for nutritional status in the elderly,
 * Prim Care, 1994; Ministério da Saúde, SISVAN.
 */
final class ImcIdosoClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $value = $result['value'];

        return match (true) {
            $value <= 22.0 => 'baixo_peso',
            $value < 27.0 => 'eutrofia',
            default => 'sobrepeso',
        };
    }
}
