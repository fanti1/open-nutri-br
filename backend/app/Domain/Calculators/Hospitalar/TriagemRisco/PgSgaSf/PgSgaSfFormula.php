<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\PgSgaSf;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * PG-SGA SF = soma dos 4 boxes já pontuados pelo paciente/profissional
 * conforme o formulário oficial: (1) histórico de peso, (2) ingestão
 * alimentar, (3) sintomas, (4) atividade/função.
 * Reference: Ottery FD, Nutrition, 1996; Bauer J, Capra S, Ferguson M,
 * Use of the scored Patient-Generated Subjective Global Assessment (PG-SGA)
 * as a nutrition assessment tool in patients with cancer, Eur J Clin Nutr, 2002.
 */
final class PgSgaSfFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $total = (float) $inputs['box1_weight_history_score']
            + (float) $inputs['box2_food_intake_score']
            + (float) $inputs['box3_symptoms_score']
            + (float) $inputs['box4_activity_function_score'];

        return ['total_score' => $total];
    }
}
