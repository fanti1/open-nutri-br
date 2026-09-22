<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Glim;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class GlimCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'glim';
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
        return [
            'weight_loss_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'weight_loss_period_months' => ['required', 'numeric', 'min:0', 'max:60'],
            'bmi' => ['required', 'numeric', 'min:5', 'max:80'],
            'age_years' => ['required', 'integer', 'min:18', 'max:120'],
            'reduced_muscle_mass' => ['required', 'in:nenhuma,leve_moderada,grave'],
            'reduced_food_intake' => ['required', 'boolean'],
            'disease_burden_inflammation' => ['required', 'boolean'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'GLIM Criteria (Global Leadership Initiative on Malnutrition)',
            citation: 'Cederholm T et al., GLIM criteria for the diagnosis of malnutrition — a consensus report, Clin Nutr / JPEN, 2019.',
        );
    }

    /** O comitê GLIM restringe explicitamente o uso a adultos (≥18 anos). */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new GlimFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new GlimClassifier;
    }
}
