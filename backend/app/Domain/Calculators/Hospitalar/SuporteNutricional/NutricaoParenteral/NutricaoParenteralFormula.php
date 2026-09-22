<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\NutricaoParenteral;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Relação kcal não-proteica : g de nitrogênio = kcal não-proteicas / (proteína(g) / 6.25).
 * Reference: ASPEN/BRASPEN Guidelines for Parenteral Nutrition.
 */
final class NutricaoParenteralFormula implements FormulaInterface
{
    private const PROTEIN_TO_NITROGEN_FACTOR = 6.25;

    public function compute(array $inputs): array
    {
        $nonProteinKcal = (float) $inputs['non_protein_kcal'];
        $proteinG = (float) $inputs['protein_g'];

        $nitrogenG = $proteinG / self::PROTEIN_TO_NITROGEN_FACTOR;

        return [
            'nitrogen_g' => round($nitrogenG, 2),
            'kcal_per_gram_nitrogen' => round($nonProteinKcal / $nitrogenG, 2),
        ];
    }
}
