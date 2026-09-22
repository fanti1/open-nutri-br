<?php

namespace App\Domain\Calculators\Pediatria\CurvasCrescimento;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Support\WeightForLengthReference;
use App\Domain\Growth\OutOfReferenceRangeException;
use App\Domain\Growth\WhoZScore;

/**
 * Escore-Z (restrito) de peso-para-comprimento/estatura, com a curva e a
 * interpolação escolhidas por WeightForLengthReference.
 * Reference: WHO Child Growth Standards, 2006.
 */
final class PesoComprimento0a5Formula implements FormulaInterface
{
    public function __construct(
        private readonly WeightForLengthReference $reference,
    ) {}

    public function compute(array $inputs): array
    {
        if ((float) $inputs['age_months'] >= 60) {
            throw new OutOfReferenceRangeException('Peso-para-comprimento/estatura da OMS se aplica a menores de 60 meses.');
        }

        $lms = $this->reference->lmsFor($inputs);
        $weight = (float) $inputs['weight_kg'];

        return [
            'z_score' => round(WhoZScore::computeAdjusted($weight, $lms), 2),
            'measure' => round($weight, 2),
            'reference_median' => round($lms->m, 2),
        ];
    }
}
