<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\AsgDetsky;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Quantos domínios o avaliador marcou em A, B e C — apoio à decisão. A ASG/SGA
 * é um julgamento clínico global, sem soma nem regra numérica: a classificação
 * final é a que o avaliador atribui (ver AsgDetskyClassifier).
 * Reference: Detsky AS et al., What is subjective global assessment of
 * nutritional status?, JPEN, 1987.
 */
final class AsgDetskyFormula implements FormulaInterface
{
    private const DOMAINS = [
        'weight_change_rating',
        'dietary_intake_rating',
        'gi_symptoms_rating',
        'functional_capacity_rating',
        'metabolic_demand_rating',
        'physical_exam_rating',
    ];

    public function compute(array $inputs): array
    {
        $counts = ['A' => 0, 'B' => 0, 'C' => 0];

        foreach (self::DOMAINS as $domain) {
            $counts[$inputs[$domain]]++;
        }

        return [
            'count_a' => (float) $counts['A'],
            'count_b' => (float) $counts['B'],
            'count_c' => (float) $counts['C'],
        ];
    }
}
