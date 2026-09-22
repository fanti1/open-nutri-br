<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\NecessidadesProteicas;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * g proteína/kg/dia por contexto clínico:
 * saudável 0.8 (IOM DRI, 2005); hospitalizado leve/moderado e crítico dentro
 * da faixa 1.2–2.0 recomendada pela ESPEN Guideline on Clinical Nutrition, 2016.
 */
final class NecessidadesProteicasFormula implements FormulaInterface
{
    public const FACTORS_G_PER_KG = [
        'saudavel' => 0.8,
        'hospitalizado_leve' => 1.2,
        'hospitalizado_moderado' => 1.5,
        'critico' => 2.0,
    ];

    public function compute(array $inputs): array
    {
        $weightKg = (float) $inputs['weight_kg'];
        $factor = self::FACTORS_G_PER_KG[$inputs['clinical_context']];

        return [
            'protein_g_per_day' => round($weightKg * $factor, 2),
        ];
    }
}
