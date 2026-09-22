<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\AnemiaOms;

/**
 * Pontos de corte de hemoglobina (g/dL) da OMS por grupo populacional.
 * Retorna [sem anemia a partir de, leve a partir de, moderada a partir de];
 * abaixo do último é anemia grave.
 * Reference: WHO, Haemoglobin concentrations for the diagnosis of anaemia and
 * assessment of severity (WHO/NMH/NHD/MNM/11.1), 2011 — Tabela 1.
 */
final class AnemiaCutoffs
{
    /**
     * @return array{0: float, 1: float, 2: float}
     */
    public static function for(float $ageYears, string $sex, bool $pregnant): array
    {
        return match (true) {
            $sex === 'female' && $pregnant => [11.0, 10.0, 7.0],
            $ageYears < 5 => [11.0, 10.0, 7.0],   // 6–59 meses
            $ageYears < 12 => [11.5, 11.0, 8.0],  // 5–11 anos
            $ageYears < 15 => [12.0, 11.0, 8.0],  // 12–14 anos
            $sex === 'female' => [12.0, 11.0, 8.0],
            default => [13.0, 11.0, 8.0],
        };
    }
}
