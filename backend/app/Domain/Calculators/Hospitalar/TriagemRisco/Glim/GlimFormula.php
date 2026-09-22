<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Glim;

use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * GLIM exige ≥1 critério fenotípico (perda de peso, baixo IMC, massa muscular
 * reduzida) E ≥1 critério etiológico (ingestão/absorção reduzida, inflamação/
 * doença) para o diagnóstico de desnutrição; a gravidade (moderada/grave)
 * segue o critério fenotípico mais grave presente.
 * Reference: Cederholm T et al., GLIM criteria for the diagnosis of
 * malnutrition — a consensus report, Clin Nutr / JPEN, 2019.
 */
final class GlimFormula implements FormulaInterface
{
    public function compute(array $inputs): array
    {
        $weightLossPercent = (float) $inputs['weight_loss_percent'];
        $weightLossPeriodMonths = (float) $inputs['weight_loss_period_months'];
        $bmi = (float) $inputs['bmi'];
        $ageYears = (int) $inputs['age_years'];
        $reducedMuscleMass = $inputs['reduced_muscle_mass'];
        $reducedFoodIntake = (bool) $inputs['reduced_food_intake'];
        $diseaseBurdenInflammation = (bool) $inputs['disease_burden_inflammation'];

        $bmiThresholdSevere = $ageYears >= 70 ? 20.0 : 18.5;
        $bmiThresholdModerate = $ageYears >= 70 ? 22.0 : 20.0;

        $weightLossSevere = $weightLossPeriodMonths <= 6
            ? $weightLossPercent > 10
            : $weightLossPercent > 20;

        $weightLossModerate = $weightLossPeriodMonths <= 6
            ? $weightLossPercent >= 5
            : $weightLossPercent >= 10;

        $isSevere = $weightLossSevere || $bmi < $bmiThresholdSevere || $reducedMuscleMass === 'grave';
        $isModerate = ! $isSevere && ($weightLossModerate || $bmi < $bmiThresholdModerate || $reducedMuscleMass === 'leve_moderada');

        $phenotypicSeverity = $isSevere ? 2 : ($isModerate ? 1 : 0);
        $etiologicMet = $reducedFoodIntake || $diseaseBurdenInflammation;

        return [
            'phenotypic_severity' => (float) $phenotypicSeverity,
            'etiologic_criteria_met' => $etiologicMet ? 1.0 : 0.0,
        ];
    }
}
