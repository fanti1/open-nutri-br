<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Conut;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * CONUT soma 3 subescores por faixa: albumina sérica, colesterol total e
 * contagem total de linfócitos — Tabela I do artigo original: colesterol
 * > 180 = 0; 140–180 = 1 (180 mg/dL inclusive); 100–139 = 2; < 100 = 3.
 * Reference: Ignacio de Ulíbarri J et al., Nutr Hosp, 2005.
 */
final class ConutFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $albumin = (float) $inputs['albumin_g_dl'];
        $cholesterol = (float) $inputs['total_cholesterol_mg_dl'];
        $lymphocytes = (float) $inputs['lymphocytes_cells_mm3'];

        $albuminScore = match (true) {
            $albumin >= 3.5 => 0,
            $albumin >= 3.0 => 2,
            $albumin >= 2.5 => 4,
            default => 6,
        };

        $cholesterolScore = match (true) {
            $cholesterol > 180 => 0,
            $cholesterol >= 140 => 1,
            $cholesterol >= 100 => 2,
            default => 3,
        };

        $lymphocyteScore = match (true) {
            $lymphocytes >= 1600 => 0,
            $lymphocytes >= 1200 => 1,
            $lymphocytes >= 800 => 2,
            default => 3,
        };

        return ['total_score' => (float) ($albuminScore + $cholesterolScore + $lymphocyteScore)];
    }
}
