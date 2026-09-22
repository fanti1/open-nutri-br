<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\AsgDetsky;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * A ASG/SGA original é um julgamento clínico global (gestalt), não uma soma
 * de pontos — Detsky et al. descrevem que a classificação final considera
 * todos os domínios, com maior peso para perda de peso e exame físico, sem
 * uma fórmula determinística publicada. Esta implementação é uma
 * simplificação de apoio: cada um dos 6 domínios recebe uma classificação
 * A/B/C do profissional (conforme o formulário original) e o resultado é a
 * categoria mais frequente entre eles (com desempate a favor da mais grave) —
 * uma aproximação estruturada, não um substituto do julgamento clínico.
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
