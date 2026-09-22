<?php

namespace App\Domain\Calculators\Pediatria\GastoEnergetico\NecessidadeEnergeticaInfantil;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Necessidade energética diária = peso(kg) × kcal/kg/dia da tabela oficial
 * por sexo, faixa etária (anos completos) e nível de atividade física. De 1 a
 * 6 anos o relatório publica um único valor (atividade habitual).
 * Reference: FAO/WHO/UNU, Human Energy Requirements, 2004, Tabelas 4.5 (meninos) e 4.6 (meninas).
 */
final class NecessidadeEnergeticaInfantilFormula implements FormulaInterface
{
    /** Chave = idade em anos completos (1 a 17). Valor = kcal/kg/dia (leve, moderada, intensa). */
    private const KCAL_PER_KG = [
        'male' => [
            1 => [82, 82, 82], 2 => [84, 84, 84], 3 => [80, 80, 80], 4 => [77, 77, 77], 5 => [74, 74, 74],
            6 => [62, 73, 84], 7 => [60, 71, 81], 8 => [59, 69, 79], 9 => [56, 67, 76], 10 => [55, 65, 74],
            11 => [53, 62, 72], 12 => [51, 60, 69], 13 => [49, 58, 66], 14 => [48, 56, 65], 15 => [45, 53, 62],
            16 => [44, 52, 59], 17 => [43, 50, 57],
        ],
        'female' => [
            1 => [80, 80, 80], 2 => [81, 81, 81], 3 => [77, 77, 77], 4 => [74, 74, 74], 5 => [72, 72, 72],
            6 => [59, 69, 80], 7 => [57, 67, 77], 8 => [54, 64, 73], 9 => [52, 61, 70], 10 => [49, 58, 66],
            11 => [47, 55, 63], 12 => [44, 52, 60], 13 => [42, 49, 57], 14 => [40, 47, 54], 15 => [39, 45, 52],
            16 => [38, 44, 51], 17 => [37, 44, 51],
        ],
    ];

    private const ACTIVITY_INDEX = ['leve' => 0, 'moderada' => 1, 'intensa' => 2];

    public function compute(array $inputs): array
    {
        $completedYears = (int) floor((float) $inputs['age_years']);
        $kcalPerKg = self::KCAL_PER_KG[$inputs['sex']][$completedYears][self::ACTIVITY_INDEX[$inputs['activity_level']]];

        return [
            'kcal_per_kg' => (float) $kcalPerKg,
            'kcal_per_day' => round($kcalPerKg * (float) $inputs['weight_kg'], 2),
        ];
    }
}
