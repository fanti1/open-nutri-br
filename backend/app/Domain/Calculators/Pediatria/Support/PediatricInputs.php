<?php

namespace App\Domain\Calculators\Pediatria\Support;

use App\Domain\Growth\WhoMeasurements;

/** Conversões de entrada compartilhadas pelas calculadoras pediátricas (sexo e medidas padronizadas OMS). */
final class PediatricInputs
{
    /** Código de sexo das tabelas da OMS: 1 = masculino, 2 = feminino. */
    public static function whoSex(array $inputs): int
    {
        return $inputs['sex'] === 'male' ? 1 : 2;
    }

    public static function standardizedLength(array $inputs): float
    {
        return WhoMeasurements::standardizedLength(
            (float) $inputs['length_cm'],
            $inputs['measurement_position'],
            (float) $inputs['age_months'],
        );
    }

    public static function bmi(array $inputs): float
    {
        return (float) $inputs['weight_kg'] / ((self::standardizedLength($inputs) / 100) ** 2);
    }

    /** @return array<string, array<int, string>> */
    public static function ageSexSchema(float $maxMonths, float $minMonths = 0): array
    {
        return [
            'age_months' => ['required', 'numeric', "min:{$minMonths}", "max:{$maxMonths}"],
            'sex' => ['required', 'in:male,female'],
        ];
    }

    /** @return array<string, array<int, string>> */
    public static function lengthSchema(): array
    {
        return [
            'length_cm' => ['required', 'numeric', 'min:35', 'max:130'],
            'measurement_position' => ['required', 'in:'.WhoMeasurements::POSITION_LYING.','.WhoMeasurements::POSITION_STANDING],
        ];
    }
}
