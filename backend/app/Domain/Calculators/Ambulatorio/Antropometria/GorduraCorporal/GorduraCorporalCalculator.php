<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\GorduraCorporal;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class GorduraCorporalCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'gordura-corporal';
    }

    public function module(): string
    {
        return 'ambulatorio';
    }

    public function category(): string
    {
        return 'antropometria';
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
            'age_years' => ['required', 'integer', 'min:1', 'max:120'],
            'sex' => ['required', 'in:male,female'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: '% Gordura Corporal (fórmula de Deurenberg)',
            citation: 'Deurenberg P, Weststrate JA, Seidell JC, Body mass index as a measure of body fatness, Br J Nutr, 1991.',
        );
    }

    /**
     * Esta versão da equação de Deurenberg (1991) foi validada em adultos; há
     * uma variante pediátrica distinta na literatura, ainda não implementada.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new GorduraCorporalFormula;
    }
}
