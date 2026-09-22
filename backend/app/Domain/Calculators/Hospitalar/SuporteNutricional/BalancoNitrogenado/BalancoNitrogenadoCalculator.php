<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\BalancoNitrogenado;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class BalancoNitrogenadoCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'balanco-nitrogenado';
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
            'protein_intake_g' => ['required', 'numeric', 'min:0', 'max:1000'],
            'urinary_urea_nitrogen_24h_g' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Balanço Nitrogenado',
            citation: 'Blackburn GL et al., Nutritional and metabolic assessment of the hospitalized patient, JPEN, 1977.',
        );
    }

    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new BalancoNitrogenadoFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new BalancoNitrogenadoClassifier;
    }
}
