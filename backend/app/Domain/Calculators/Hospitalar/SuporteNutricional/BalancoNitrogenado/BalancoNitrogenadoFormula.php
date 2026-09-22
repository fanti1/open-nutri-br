<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\BalancoNitrogenado;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * BN(g/dia) = (proteína ingerida(g) / 6.25) − (Nitrogênio Ureico Urinário de
 * 24h(g) + 4). O fator 6.25 converte proteína em nitrogênio (proteína ≈16% N);
 * a constante 4 estima perdas não-ureicas de nitrogênio (fezes, pele, etc.).
 * Reference: Blackburn GL et al., Nutritional and metabolic assessment of the
 * hospitalized patient, JPEN, 1977.
 */
final class BalancoNitrogenadoFormula implements FormulaInterface
{
    private const PROTEIN_TO_NITROGEN_FACTOR = 6.25;

    private const NON_UREIC_LOSSES_G = 4;

    public function compute(array $inputs): array
    {
        $proteinIntakeG = (float) $inputs['protein_intake_g'];
        $urinaryUreaNitrogen24h = (float) $inputs['urinary_urea_nitrogen_24h_g'];

        $nitrogenIntake = $proteinIntakeG / self::PROTEIN_TO_NITROGEN_FACTOR;
        $balance = $nitrogenIntake - ($urinaryUreaNitrogen24h + self::NON_UREIC_LOSSES_G);

        return ['balance_g_per_day' => round($balance, 2)];
    }
}
