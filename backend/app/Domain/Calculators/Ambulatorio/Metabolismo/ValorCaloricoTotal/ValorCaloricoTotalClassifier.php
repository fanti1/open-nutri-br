<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\ValorCaloricoTotal;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Support\Cutoff;

/**
 * Estilo de vida correspondente ao PAL, FAO/WHO/UNU (2004), Tabela 5.3:
 * sedentário ou atividade leve 1,40–1,69 · ativo ou moderadamente ativo
 * 1,70–1,99 · vigorosamente ativo 2,00–2,40.
 */
final class ValorCaloricoTotalClassifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $pal = (float) $inputs['pal'];

        return match (true) {
            Cutoff::reaches($pal, 2.0) => 'vigorosamente_ativo',
            Cutoff::reaches($pal, 1.7) => 'ativo_ou_moderadamente_ativo',
            default => 'sedentario_ou_atividade_leve',
        };
    }
}
