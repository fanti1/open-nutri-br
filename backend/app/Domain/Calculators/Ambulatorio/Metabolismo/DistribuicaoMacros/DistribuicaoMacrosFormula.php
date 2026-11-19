<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\DistribuicaoMacros;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\IncompleteInputsException;

/**
 * Converte percentuais de macronutrientes (dentro das faixas AMDR) em gramas/dia,
 * usando os fatores de Atwater (4 kcal/g para carboidrato e proteína, 9 kcal/g para lipídio).
 * Faixas AMDR: CHO 45–65%, PTN 10–35%, LIP 20–35% do VCT.
 * Reference: Institute of Medicine, Dietary Reference Intakes (AMDR), 2005.
 */
final class DistribuicaoMacrosFormula implements FormulaInterface
{
    private const KCAL_PER_G_CARB_OR_PROTEIN = 4;

    private const KCAL_PER_G_FAT = 9;

    public function compute(array $inputs): array
    {
        $totalKcal = (float) $inputs['total_kcal'];
        $carbPercent = (float) $inputs['carb_percent'];
        $proteinPercent = (float) $inputs['protein_percent'];
        $fatPercent = (float) $inputs['fat_percent'];

        // Uma distribuição reparte o VCT inteiro: os três percentuais somam 100%.
        $sum = $carbPercent + $proteinPercent + $fatPercent;
        if (abs($sum - 100) > 1e-6) {
            throw new IncompleteInputsException(sprintf(
                'A soma de carboidratos, proteínas e lipídios precisa ser 100%% (está em %s%%).',
                str_replace('.', ',', (string) round($sum, 2)),
            ));
        }

        return [
            'carbohydrate_g' => round(($totalKcal * $carbPercent / 100) / self::KCAL_PER_G_CARB_OR_PROTEIN, 2),
            'protein_g' => round(($totalKcal * $proteinPercent / 100) / self::KCAL_PER_G_CARB_OR_PROTEIN, 2),
            'fat_g' => round(($totalKcal * $fatPercent / 100) / self::KCAL_PER_G_FAT, 2),
        ];
    }
}
