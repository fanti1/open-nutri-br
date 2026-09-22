<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Nrs2002;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * NRS-2002 = escore de estado nutricional (0-3) + escore de gravidade da doença
 * (0-3) + ajuste de idade (+1 se ≥70 anos). Os dois primeiros escores são
 * julgamentos clínicos categóricos feitos pelo profissional a partir da tabela
 * original de Kondrup et al. — o app soma, não deriva os subescores automaticamente.
 * Reference: Kondrup J et al., Nutritional risk screening (NRS 2002), Clin Nutr, 2003.
 */
final class Nrs2002Formula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $ageAdjustment = ((int) $inputs['age_years']) >= 70 ? 1 : 0;

        $total = (int) $inputs['nutritional_status_score'] + (int) $inputs['severity_score'] + $ageAdjustment;

        return ['total_score' => (float) $total];
    }
}
