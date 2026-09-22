<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\AsgDetsky;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class AsgDetskyCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'asg-detsky';
    }

    public function module(): string
    {
        return 'hospitalar';
    }

    public function category(): string
    {
        return 'triagem_risco';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        $rule = ['required', 'in:A,B,C'];

        return [
            'weight_change_rating' => $rule,
            'dietary_intake_rating' => $rule,
            'gi_symptoms_rating' => $rule,
            'functional_capacity_rating' => $rule,
            'metabolic_demand_rating' => $rule,
            'physical_exam_rating' => $rule,
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'ASG / SGA (Avaliação Subjetiva Global — Detsky)',
            citation: 'Detsky AS et al., What is subjective global assessment of nutritional status?, JPEN, 1987.',
        );
    }

    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new AsgDetskyFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new AsgDetskyClassifier;
    }
}
