<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\FerritinaOms;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class FerritinaOmsCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'ferritina-oms';
    }

    public function module(): string
    {
        return 'bioquimica';
    }

    public function category(): string
    {
        return 'hematologia';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'age_years' => ['required', 'numeric', 'min:0', 'max:120'],
            'inflammation' => ['required', 'boolean'],
            'ferritin_ng_ml' => ['required', 'numeric', 'min:0', 'max:10000'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Deficiência de ferro pela ferritina sérica (OMS)',
            citation: 'World Health Organization, WHO guideline on use of ferritin concentrations to assess iron status in individuals and populations, 2020.',
        );
    }

    /** A diretriz define cortes para menores de 5 anos e para os demais (inclui adultos e idosos). */
    public function lifeStages(): array
    {
        return [LifeStage::Child, LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new FerritinaOmsFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new FerritinaOmsClassifier;
    }
}
