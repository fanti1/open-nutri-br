<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Nrs2002;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class Nrs2002Calculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'nrs-2002';
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
            'nutritional_status_score' => ['required', 'integer', 'between:0,3'],
            'severity_score' => ['required', 'integer', 'between:0,3'],
            'age_years' => ['required', 'integer', 'min:1', 'max:120'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'NRS-2002 (Nutritional Risk Screening)',
            citation: 'Kondrup J et al., Nutritional risk screening (NRS 2002): a new method based on an analysis of controlled clinical trials, Clin Nutr, 2003.',
        );
    }

    /** Ferramenta validada para pacientes hospitalizados adultos. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new Nrs2002Formula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new Nrs2002Classifier;
    }
}
