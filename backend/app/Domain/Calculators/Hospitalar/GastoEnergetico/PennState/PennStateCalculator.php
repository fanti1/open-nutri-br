<?php

namespace App\Domain\Calculators\Hospitalar\GastoEnergetico\PennState;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class PennStateCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'penn-state';
    }

    public function module(): string
    {
        return 'hospitalar';
    }

    public function category(): string
    {
        return 'gasto_energetico';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'weight_kg' => ['required', 'numeric', 'min:20', 'max:500'],
            'height_cm' => ['required', 'numeric', 'min:100', 'max:250'],
            'age_years' => ['required', 'integer', 'min:18', 'max:120'],
            'sex' => ['required', 'in:male,female'],
            'minute_ventilation_l_min' => ['required', 'numeric', 'min:1', 'max:40'],
            'max_temperature_c' => ['required', 'numeric', 'min:33', 'max:43'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Gasto energético de repouso em ventilação mecânica (Penn State 2003b / 2010)',
            citation: 'Frankenfield D, Smith JS, Cooney RN, Validation of 2 approaches to predicting resting metabolic rate in critically ill patients, JPEN, 2004; Frankenfield DC et al., JPEN, 2009; Frankenfield D, Validation of an equation for resting metabolic rate in older obese, critically ill patients, JPEN, 2011.',
        );
    }

    /** Adultos ventilados, com versão própria validada para idosos com obesidade. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new PennStateFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new PennStateClassifier;
    }
}
