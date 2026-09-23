<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\JacksonPollock7;

use App\Domain\Calculators\Ambulatorio\Antropometria\Support\SkinfoldBodyFat;
use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Densidade corporal por 7 dobras (peitoral, axilar média, tríceps,
 * subescapular, abdominal, suprailíaca, coxa), convertida em % de gordura (Siri).
 * Homens (1978): D = 1,112 − 0,00043499·Σ + 0,00000055·Σ² − 0,00028826·idade
 * Mulheres (1980): D = 1,097 − 0,00046971·Σ + 0,00000056·Σ² − 0,00012828·idade
 */
final class JacksonPollock7Formula implements FormulaInterface
{
    public const SITES = [
        'skinfold_chest_mm',
        'skinfold_midaxillary_mm',
        'skinfold_triceps_mm',
        'skinfold_subscapular_mm',
        'skinfold_abdominal_mm',
        'skinfold_suprailiac_mm',
        'skinfold_thigh_mm',
    ];

    public function compute(array $inputs): array
    {
        $sum = array_sum(array_map(fn (string $site) => (float) $inputs[$site], self::SITES));
        $age = (float) $inputs['age_years'];

        $density = $inputs['sex'] === 'male'
            ? 1.112 - 0.00043499 * $sum + 0.00000055 * $sum ** 2 - 0.00028826 * $age
            : 1.097 - 0.00046971 * $sum + 0.00000056 * $sum ** 2 - 0.00012828 * $age;

        return SkinfoldBodyFat::fromDensity($density, $sum);
    }
}
