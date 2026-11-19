<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\ValorCaloricoTotal;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * VCT = TMB × PAL (nível de atividade física, 1,40 a 2,40).
 * Reference: FAO/WHO/UNU, Human Energy Requirements, 2004 — seção 5.4.1 e Tabela 5.3.
 */
final class ValorCaloricoTotalFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        return [
            'vct_kcal' => round((float) $inputs['bmr_kcal'] * (float) $inputs['pal'], 2),
        ];
    }
}
