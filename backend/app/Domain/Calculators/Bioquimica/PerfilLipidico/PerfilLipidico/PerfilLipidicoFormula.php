<?php

namespace App\Domain\Calculators\Bioquimica\PerfilLipidico\PerfilLipidico;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\IncompleteInputsException;
use App\Domain\Calculators\Support\Cutoff;

/**
 * LDL-c (Martin/Hopkins) = CT − HDL-c − TG/fator, com o fator (razão TG:VLDL-c)
 * da tabela de 180 células por faixa de TG e de não-HDL-c. Com TG > 800 mg/dL o
 * LDL-c pode sair subestimado e a SBC (2025) manda avaliar o não-HDL-c: o LDL
 * fica de fora do resultado. Não-HDL-c = CT − HDL-c.
 * Reference: Martin SS et al., JAMA, 2013; SBC, Diretriz Brasileira de
 * Dislipidemias e Prevenção da Aterosclerose – 2025.
 */
final class PerfilLipidicoFormula implements FormulaInterface
{
    public const MARTIN_MAX_TG = 800;

    /** Limite inferior (mg/dL) de cada faixa de triglicerídeos (7–49, 50–56, …, 400–13.975). */
    private const TG_BOUNDS = [7, 50, 57, 62, 67, 72, 76, 80, 84, 88, 93, 97, 101, 106, 111, 116, 121, 127, 133, 139, 147, 155, 164, 174, 186, 202, 221, 248, 293, 400];

    /** Limite inferior (mg/dL) de cada faixa de não-HDL-c: < 100, 100–129, 130–159, 160–189, 190–219, ≥ 220. */
    private const NON_HDL_BOUNDS = [-INF, 100, 130, 160, 190, 220];

    /**
     * Martin SS et al., JAMA, 2013; conferido na Tabela 1 da Atualização da
     * Diretriz Brasileira de Dislipidemias (SBC, 2017) e no pacote LDLcalc (CRAN).
     */
    private const FACTORS = [
        [3.5, 3.4, 3.3, 3.3, 3.2, 3.1],
        [4.0, 3.9, 3.7, 3.6, 3.6, 3.4],
        [4.3, 4.1, 4.0, 3.9, 3.8, 3.6],
        [4.5, 4.3, 4.1, 4.0, 3.9, 3.9],
        [4.7, 4.4, 4.3, 4.2, 4.1, 3.9],
        [4.8, 4.6, 4.4, 4.2, 4.2, 4.1],
        [4.9, 4.6, 4.5, 4.3, 4.3, 4.2],
        [5.0, 4.8, 4.6, 4.4, 4.3, 4.2],
        [5.1, 4.8, 4.6, 4.5, 4.4, 4.3],
        [5.2, 4.9, 4.7, 4.6, 4.4, 4.3],
        [5.3, 5.0, 4.8, 4.7, 4.5, 4.4],
        [5.4, 5.1, 4.8, 4.7, 4.5, 4.3],
        [5.5, 5.2, 5.0, 4.7, 4.6, 4.5],
        [5.6, 5.3, 5.0, 4.8, 4.6, 4.5],
        [5.7, 5.4, 5.1, 4.9, 4.7, 4.5],
        [5.8, 5.5, 5.2, 5.0, 4.8, 4.6],
        [6.0, 5.5, 5.3, 5.0, 4.8, 4.6],
        [6.1, 5.7, 5.3, 5.1, 4.9, 4.7],
        [6.2, 5.8, 5.4, 5.2, 5.0, 4.7],
        [6.3, 5.9, 5.6, 5.3, 5.0, 4.8],
        [6.5, 6.0, 5.7, 5.4, 5.1, 4.8],
        [6.7, 6.2, 5.8, 5.4, 5.2, 4.9],
        [6.8, 6.3, 5.9, 5.5, 5.3, 5.0],
        [7.0, 6.5, 6.0, 5.7, 5.4, 5.1],
        [7.3, 6.7, 6.2, 5.8, 5.5, 5.2],
        [7.6, 6.9, 6.4, 6.0, 5.6, 5.3],
        [8.0, 7.2, 6.6, 6.2, 5.9, 5.4],
        [8.5, 7.6, 7.0, 6.5, 6.1, 5.6],
        [9.5, 8.3, 7.5, 7.0, 6.5, 5.9],
        [11.9, 10.0, 8.8, 8.1, 7.5, 6.7],
    ];

    public function compute(array $inputs): array
    {
        $total = (float) $inputs['total_cholesterol_mg_dl'];
        $hdl = (float) $inputs['hdl_mg_dl'];
        $triglycerides = (float) $inputs['triglycerides_mg_dl'];

        // O HDL-c é uma fração do colesterol total.
        if ($hdl >= $total) {
            throw new IncompleteInputsException('O HDL-c precisa ser menor que o colesterol total.');
        }

        $nonHdl = $total - $hdl;
        $values = [];

        if (! Cutoff::exceeds($triglycerides, self::MARTIN_MAX_TG)) {
            $factor = self::factor($triglycerides, $nonHdl);
            $values['ldl_mg_dl'] = round($nonHdl - $triglycerides / $factor, 2);
            $values['martin_factor'] = $factor;
        }

        $values['non_hdl_mg_dl'] = round($nonHdl, 2);

        return $values;
    }

    public static function factor(float $triglycerides, float $nonHdl): float
    {
        return self::FACTORS[self::bandIndex(self::TG_BOUNDS, $triglycerides)][self::bandIndex(self::NON_HDL_BOUNDS, $nonHdl)];
    }

    /** Índice da última faixa cujo limite inferior o valor alcança. */
    private static function bandIndex(array $bounds, float $value): int
    {
        $index = 0;
        foreach ($bounds as $i => $bound) {
            if (Cutoff::reaches($value, $bound)) {
                $index = $i;
            }
        }

        return $index;
    }
}
