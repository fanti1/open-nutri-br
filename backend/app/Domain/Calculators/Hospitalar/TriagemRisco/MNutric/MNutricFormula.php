<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\MNutric;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * mNUTRIC (versão modificada, sem IL-6): soma pontos por idade, APACHE II,
 * SOFA, número de comorbidades e dias entre internação hospitalar e admissão
 * na UTI.
 * Reference: Heyland DK et al., Crit Care, 2011 (NUTRIC original);
 * Rahman A et al., Clin Nutr, 2016 (validação da versão modificada sem IL-6).
 */
final class MNutricFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $age = (float) $inputs['age_years'];
        $apache = (float) $inputs['apache_ii'];
        $sofa = (float) $inputs['sofa'];
        $comorbidities = (int) $inputs['comorbidities_count'];
        $daysToIcu = (float) $inputs['days_hospital_to_icu'];

        $agePoints = match (true) {
            $age < 50 => 0,
            $age < 75 => 1,
            default => 2,
        };

        $apachePoints = match (true) {
            $apache < 15 => 0,
            $apache < 20 => 1,
            $apache < 28 => 2,
            default => 3,
        };

        $sofaPoints = match (true) {
            $sofa < 6 => 0,
            $sofa < 10 => 1,
            default => 2,
        };

        $comorbidityPoints = $comorbidities >= 2 ? 1 : 0;
        $daysPoints = $daysToIcu >= 1 ? 1 : 0;

        $total = $agePoints + $apachePoints + $sofaPoints + $comorbidityPoints + $daysPoints;

        return ['total_score' => (float) $total];
    }
}
