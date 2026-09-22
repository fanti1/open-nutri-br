<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\NutricaoParenteral;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class NutricaoParenteralCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'nutricao-parenteral';
    }

    public function module(): string
    {
        return 'hospitalar';
    }

    public function category(): string
    {
        return 'suporte_nutricional';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'non_protein_kcal' => ['required', 'numeric', 'min:0', 'max:10000'],
            'protein_g' => ['required', 'numeric', 'min:0.1', 'max:1000'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Nutrição Parenteral (relação kcal não-proteica : N)',
            citation: 'ASPEN/BRASPEN Guidelines for Parenteral Nutrition.',
        );
    }

    /** Faixa 100-150:1 citada é a recomendação para adultos; pediatria usa relações próprias. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new NutricaoParenteralFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new NutricaoParenteralClassifier;
    }
}
