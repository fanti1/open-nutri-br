<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\Support;

/**
 * Formato comum dos resultados das equações de dobras cutâneas: a densidade
 * corporal prevista vira % de gordura pela equação de Siri,
 * %G = (4,95 / D − 4,50) × 100.
 * Reference: Siri WE, Body composition from fluid spaces and density, 1961.
 */
final class SkinfoldBodyFat
{
    /**
     * @return array{body_fat_percent: float, body_density: float, sum_skinfolds_mm: float}
     */
    public static function fromDensity(float $density, float $sumSkinfolds): array
    {
        return [
            'body_fat_percent' => round((4.95 / $density - 4.50) * 100, 2),
            'body_density' => round($density, 4),
            'sum_skinfolds_mm' => round($sumSkinfolds, 2),
        ];
    }
}
