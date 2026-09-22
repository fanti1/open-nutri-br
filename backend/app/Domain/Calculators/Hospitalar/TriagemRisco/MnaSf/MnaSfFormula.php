<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\MnaSf;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * MNA-SF (versão curta, 0-14 pontos): soma de 6 itens já pontuados pelo
 * profissional conforme a tabela oficial (ingestão alimentar, perda de peso,
 * mobilidade, estresse psicológico/doença aguda, problemas neuropsicológicos, IMC).
 * Reference: Rubenstein LZ et al., J Gerontol A Biol Sci Med Sci, 2001.
 */
final class MnaSfFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $total = (int) $inputs['food_intake_score']
            + (int) $inputs['weight_loss_score']
            + (int) $inputs['mobility_score']
            + (int) $inputs['psychological_stress_score']
            + (int) $inputs['neuropsychological_score']
            + (int) $inputs['bmi_score'];

        return ['total_score' => (float) $total];
    }
}
