<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Pni;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * PNI(%) = 158 − 16.6×albumina(g/dL) − 0.78×prega cutânea tricipital(mm)
 * − 0.2×transferrina(mg/dL) − 5.8×hipersensibilidade cutânea tardia
 * (0=anérgico, 1=<5mm, 2=≥5mm de induração).
 * Sem classificação: as faixas de risco não foram conferidas no artigo original.
 * Reference: Buzby GP et al., Am J Surg, 1980.
 */
final class PniFormula implements FormulaInterface
{
    private const DH_SCORES = [
        'anergico' => 0,
        'menor_5mm' => 1,
        'maior_igual_5mm' => 2,
    ];

    public function compute(array $inputs): array
    {
        $albumin = (float) $inputs['albumin_g_dl'];
        $tricepsSkinfold = (float) $inputs['triceps_skinfold_mm'];
        $transferrin = (float) $inputs['transferrin_mg_dl'];
        $dhScore = self::DH_SCORES[$inputs['delayed_hypersensitivity']];

        $pni = 158 - (16.6 * $albumin) - (0.78 * $tricepsSkinfold) - (0.2 * $transferrin) - (5.8 * $dhScore);

        return ['pni_percent' => round($pni, 2)];
    }
}
