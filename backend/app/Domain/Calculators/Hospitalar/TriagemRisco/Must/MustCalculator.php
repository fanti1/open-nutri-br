<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Must;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class MustCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'must';
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
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            'height_m' => ['required', 'numeric', 'min:0.3', 'max:2.5'],
            'weight_loss_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'acute_disease_effect' => ['required', 'boolean'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'MUST (Malnutrition Universal Screening Tool)',
            citation: 'BAPEN / Malnutrition Advisory Group, The MUST Report, 2003.',
        );
    }

    /** Ferramenta de triagem geral para adultos (há variante pediátrica distinta: STRONGkids/STAMP). */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new MustFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new MustClassifier;
    }
}
