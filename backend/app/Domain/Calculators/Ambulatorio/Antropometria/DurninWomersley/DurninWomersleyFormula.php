<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\DurninWomersley;

use App\Domain\Calculators\Ambulatorio\Antropometria\Support\SkinfoldBodyFat;
use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * D = c − m × log10(Σ bíceps + tríceps + subescapular + suprailíaca, em mm),
 * com c e m por sexo e faixa etária; % de gordura pela equação de Siri.
 * Reference: Durnin JVGA, Womersley J, Br J Nutr, 1974.
 */
final class DurninWomersleyFormula implements FormulaInterface
{
    /** @var array<string, list<array{0: int, 1: float, 2: float}>> [idade mínima, c, m] */
    private const COEFFICIENTS = [
        'male' => [
            [17, 1.1620, 0.0630],
            [20, 1.1631, 0.0632],
            [30, 1.1422, 0.0544],
            [40, 1.1620, 0.0700],
            [50, 1.1715, 0.0779],
        ],
        'female' => [
            [17, 1.1549, 0.0678],
            [20, 1.1599, 0.0717],
            [30, 1.1423, 0.0632],
            [40, 1.1333, 0.0612],
            [50, 1.1339, 0.0645],
        ],
    ];

    public function compute(array $inputs): array
    {
        $sum = (float) $inputs['skinfold_biceps_mm']
            + (float) $inputs['skinfold_triceps_mm']
            + (float) $inputs['skinfold_subscapular_mm']
            + (float) $inputs['skinfold_suprailiac_mm'];

        [$c, $m] = self::coefficients($inputs['sex'], (float) $inputs['age_years']);

        return SkinfoldBodyFat::fromDensity($c - $m * log10($sum), $sum);
    }

    /**
     * @return array{0: float, 1: float}
     */
    private static function coefficients(string $sex, float $age): array
    {
        $selected = self::COEFFICIENTS[$sex][0];

        foreach (self::COEFFICIENTS[$sex] as $row) {
            if ($age >= $row[0]) {
                $selected = $row;
            }
        }

        return [$selected[1], $selected[2]];
    }
}
