<?php

namespace App\Domain\Growth;

/**
 * Escore-Z pelo método LMS, replicando compute_zscore / compute_zscore_adjusted
 * do pacote oficial `anthro` da OMS.
 * Reference: WHO Child Growth Standards: Methods and development, 2006, cap. 7.
 */
final class WhoZScore
{
    public static function compute(float $y, LmsParameters $lms): float
    {
        return ((($y / $lms->m) ** $lms->l) - 1) / ($lms->s * $lms->l);
    }

    /**
     * Versão "restrita" usada pela OMS nos indicadores baseados em peso: acima
     * de +3 ou abaixo de −3 o escore é recalculado pela distância entre os
     * pontos de 2 e 3 DP, porque a cauda da distribuição Box-Cox se afasta dos dados reais.
     */
    public static function computeAdjusted(float $y, LmsParameters $lms): float
    {
        $z = self::compute($y, $lms);

        if ($z > 3) {
            $sd3pos = self::valueAtZ(3, $lms);
            $sd23pos = $sd3pos - self::valueAtZ(2, $lms);

            return 3 + (($y - $sd3pos) / $sd23pos);
        }

        if ($z < -3) {
            $sd3neg = self::valueAtZ(-3, $lms);
            $sd23neg = self::valueAtZ(-2, $lms) - $sd3neg;

            return -3 + (($y - $sd3neg) / $sd23neg);
        }

        return $z;
    }

    public static function valueAtZ(float $z, LmsParameters $lms): float
    {
        return $lms->m * ((1 + $lms->l * $lms->s * $z) ** (1 / $lms->l));
    }
}
