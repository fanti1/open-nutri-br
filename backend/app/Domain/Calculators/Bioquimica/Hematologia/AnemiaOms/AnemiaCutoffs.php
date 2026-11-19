<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\AnemiaOms;

use App\Domain\Calculators\IncompleteInputsException;

/**
 * Pontos de corte de hemoglobina (g/dL) da OMS por grupo populacional e os
 * ajustes da hemoglobina pela altitude da residência e pelo tabagismo.
 * Reference: WHO, Guideline on haemoglobin cutoffs to define anaemia in
 * individuals and populations, 2024 — Tabelas 3, 4 e 5.
 */
final class AnemiaCutoffs
{
    /** Tabela 4: ajuste (g/L) por faixa de 500 m de altitude da residência, de 0 m a 4.999 m. */
    private const ALTITUDE_ADJUSTMENT_G_L = [0, 4, 8, 11, 14, 18, 21, 25, 29, 33];

    /** Tabela 5: ajuste (g/L) pelo tabagismo. */
    public const SMOKING_ADJUSTMENT_G_L = [
        'nao_fuma' => 0,
        'fuma_quantidade_desconhecida' => 3,
        'menos_de_10_cigarros_dia' => 3,
        '10_a_19_cigarros_dia' => 5,
        '20_ou_mais_cigarros_dia' => 6,
    ];

    /**
     * [sem anemia a partir de, leve a partir de, moderada a partir de]; abaixo do último é anemia grave.
     *
     * @param  array<string, mixed>  $inputs
     * @return array{0: float, 1: float, 2: float}
     */
    public static function for(array $inputs): array
    {
        $ageYears = (float) $inputs['age_years'];

        if ($inputs['sex'] === 'female' && (bool) $inputs['pregnant']) {
            $trimester = $inputs['pregnancy_trimester'] ?? null;
            if ($trimester === null) {
                throw new IncompleteInputsException('Informe o trimestre da gestação.');
            }

            return (int) $trimester === 2 ? [10.5, 9.5, 7.0] : [11.0, 10.0, 7.0];
        }

        return match (true) {
            $ageYears < 2 => [10.5, 9.5, 7.0],    // 6–23 meses
            $ageYears < 5 => [11.0, 10.0, 7.0],   // 24–59 meses
            $ageYears < 12 => [11.5, 11.0, 8.0],  // 5–11 anos
            $ageYears < 15 => [12.0, 11.0, 8.0],  // 12–14 anos
            $inputs['sex'] === 'female' => [12.0, 11.0, 8.0],
            default => [13.0, 11.0, 8.0],
        };
    }

    /**
     * Quanto subtrair (g/dL) da hemoglobina observada pela altitude e pelo tabagismo.
     *
     * @param  array<string, mixed>  $inputs
     */
    public static function adjustment(array $inputs): float
    {
        $altitude = empty($inputs['altitude_m']) ? 0 : self::ALTITUDE_ADJUSTMENT_G_L[intdiv((int) $inputs['altitude_m'], 500)];
        $smoking = empty($inputs['smoking']) ? 0 : self::SMOKING_ADJUSTMENT_G_L[$inputs['smoking']];

        return ($altitude + $smoking) / 10;
    }
}
