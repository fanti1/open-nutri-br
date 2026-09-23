<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\JacksonPollock3;

use App\Domain\Calculators\Ambulatorio\Antropometria\Support\SkinfoldBodyFat;
use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Densidade corporal por 3 dobras (Σ em mm), convertida em % de gordura (Siri).
 * Homens (peitoral, abdominal, coxa — Jackson & Pollock, 1978):
 *   D = 1,10938 − 0,0008267·Σ + 0,0000016·Σ² − 0,0002574·idade
 * Mulheres (tríceps, suprailíaca, coxa — Jackson, Pollock & Ward, 1980):
 *   D = 1,0994921 − 0,0009929·Σ + 0,0000023·Σ² − 0,0001392·idade
 */
final class JacksonPollock3Formula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $age = (float) $inputs['age_years'];

        if ($inputs['sex'] === 'male') {
            $sum = (float) $inputs['skinfold_chest_mm'] + (float) $inputs['skinfold_abdominal_mm'] + (float) $inputs['skinfold_thigh_mm'];
            $density = 1.10938 - 0.0008267 * $sum + 0.0000016 * $sum ** 2 - 0.0002574 * $age;
        } else {
            $sum = (float) $inputs['skinfold_triceps_mm'] + (float) $inputs['skinfold_suprailiac_mm'] + (float) $inputs['skinfold_thigh_mm'];
            $density = 1.0994921 - 0.0009929 * $sum + 0.0000023 * $sum ** 2 - 0.0001392 * $age;
        }

        return SkinfoldBodyFat::fromDensity($density, $sum);
    }
}
