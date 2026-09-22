<?php

namespace App\Domain\Growth;

/**
 * Padronizações de idade e comprimento/estatura exatamente como no pacote
 * oficial `anthro` da OMS (age_to_days, round_up, adjust_lenhei).
 */
final class WhoMeasurements
{
    public const DAYS_PER_MONTH = 30.4375;

    /** Limite (dias) a partir do qual a criança deve ser medida em pé. */
    public const STANDING_FROM_DAYS = 731;

    public const POSITION_LYING = 'deitado';

    public const POSITION_STANDING = 'em_pe';

    /** Arredonda meia unidade para cima, como round_up() da OMS. */
    public static function ageInDays(float $ageMonths): int
    {
        $days = $ageMonths * self::DAYS_PER_MONTH;
        $floor = floor($days);

        return (int) ($days - $floor >= 0.5 ? $floor + 1 : $floor);
    }

    /**
     * Crianças < 2 anos são referenciadas deitadas (comprimento) e ≥ 2 anos em pé
     * (estatura); a OMS corrige 0,7 cm quando a posição medida difere da esperada.
     * Medida em pé antes dos 9 meses é considerada implausível e não é corrigida.
     */
    public static function standardizedLength(float $lengthCm, string $position, float $ageMonths): float
    {
        $ageDays = self::ageInDays($ageMonths);

        if ($position === self::POSITION_STANDING && $ageMonths < 9) {
            return $lengthCm;
        }

        if ($ageDays < self::STANDING_FROM_DAYS && $position === self::POSITION_STANDING) {
            return $lengthCm + 0.7;
        }

        if ($ageDays >= self::STANDING_FROM_DAYS && $position === self::POSITION_LYING) {
            return $lengthCm - 0.7;
        }

        return $lengthCm;
    }
}
