<?php

namespace App\Domain\Calculators\Pediatria\Support;

use App\Domain\Growth\Contracts\GrowthReferenceRepository;
use App\Domain\Growth\LmsParameters;
use App\Domain\Growth\OutOfReferenceRangeException;
use App\Domain\Growth\WhoMeasurements;

/**
 * Seleciona e interpola a curva peso-para-comprimento (< 731 dias, 45–110 cm)
 * ou peso-para-estatura (≥ 731 dias, 65–120 cm), como em
 * anthro_zscore_weight_for_lenhei() da OMS. Compartilhado pelo escore-Z de
 * peso/comprimento e pela classificação de Waterlow.
 */
final class WeightForLengthReference
{
    public function __construct(
        private readonly GrowthReferenceRepository $reference,
    ) {}

    public function lmsFor(array $inputs): LmsParameters
    {
        $length = PediatricInputs::standardizedLength($inputs);
        $lying = WhoMeasurements::ageInDays((float) $inputs['age_months']) < WhoMeasurements::STANDING_FROM_DAYS;

        [$table, $min, $max] = $lying ? ['wflanthro', 45.0, 110.0] : ['wfhanthro', 65.0, 120.0];

        if ($length < $min || $length > $max) {
            throw new OutOfReferenceRangeException(sprintf(
                'A curva peso-para-%s da OMS cobre de %s a %s cm.',
                $lying ? 'comprimento' : 'estatura',
                $min,
                $max,
            ));
        }

        return $this->reference->interpolated($table, PediatricInputs::whoSex($inputs), $length, 10)
            ?? throw new OutOfReferenceRangeException('Medida fora da faixa da curva de referência.');
    }
}
