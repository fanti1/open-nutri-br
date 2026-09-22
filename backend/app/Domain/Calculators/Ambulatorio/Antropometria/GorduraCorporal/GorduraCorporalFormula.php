<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\GorduraCorporal;

use App\Domain\Calculators\Ambulatorio\Antropometria\Imc\ImcFormula;
use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Deurenberg formula (1991), which estimates body fat % from BMI/age/sex —
 * reuses ImcFormula rather than re-deriving BMI, so the two never drift apart.
 * %GC = (1.20 × IMC) + (0.23 × idade) − (10.8 × sexo) − 5.4  (sexo: 1=homem, 0=mulher)
 * Reference: Deurenberg P, Weststrate JA, Seidell JC, Br J Nutr, 1991.
 */
final class GorduraCorporalFormula implements FormulaInterface
{
    public function __construct(
        private readonly ImcFormula $imcFormula = new ImcFormula,
    ) {}

    public function compute(array $inputs): array
    {
        $imc = $this->imcFormula->compute($inputs)['value'];
        $age = (float) $inputs['age_years'];
        $sexFactor = $inputs['sex'] === 'male' ? 1 : 0;

        $percentage = (1.20 * $imc) + (0.23 * $age) - (10.8 * $sexFactor) - 5.4;

        return [
            'percentage' => round($percentage, 2),
        ];
    }
}
