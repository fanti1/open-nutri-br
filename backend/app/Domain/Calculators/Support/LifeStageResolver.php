<?php

namespace App\Domain\Calculators\Support;

/**
 * Buckets a patient's age into the same crianca/adulto/idoso vocabulary every
 * calculator declares via lifeStages(), so the app can automatically narrow
 * the calculator list to what is scientifically valid for that specific patient
 * instead of relying on the nutritionist to remember which formulas apply.
 *
 * Cutoffs: <20 anos = criança/adolescente (cobre a WHO Growth Reference, até
 * 19 anos); 60+ = idoso, seguindo a definição legal brasileira (Estatuto do
 * Idoso, Lei 10.741/2003); o intervalo entre os dois é adulto.
 */
final class LifeStageResolver
{
    private const ELDERLY_MIN_AGE = 60;

    private const CHILD_MAX_AGE = 19;

    public static function fromAge(int $ageYears): LifeStage
    {
        return match (true) {
            $ageYears <= self::CHILD_MAX_AGE => LifeStage::Child,
            $ageYears >= self::ELDERLY_MIN_AGE => LifeStage::Elderly,
            default => LifeStage::Adult,
        };
    }
}
