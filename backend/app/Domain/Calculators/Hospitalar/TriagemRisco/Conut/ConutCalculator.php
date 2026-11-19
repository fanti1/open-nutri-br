<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Conut;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class ConutCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'conut';
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
        return 'v2';
    }

    public function inputsSchema(): array
    {
        return [
            'albumin_g_dl' => ['required', 'numeric', 'min:0', 'max:10'],
            'total_cholesterol_mg_dl' => ['required', 'numeric', 'min:0', 'max:1000'],
            'lymphocytes_cells_mm3' => ['required', 'numeric', 'min:0', 'max:20000'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'CONUT (Controlling Nutritional Status)',
            citation: 'Ignacio de Ulíbarri J et al., CONUT: a tool for controlling nutritional status, Nutr Hosp, 2005.',
        );
    }

    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new ConutFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new ConutClassifier;
    }
}
