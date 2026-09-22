<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\CinturaQuadril;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class CinturaQuadrilCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'cintura-quadril';
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
            'waist_cm' => ['required', 'numeric', 'min:30', 'max:250'],
            'hip_cm' => ['required', 'numeric', 'min:30', 'max:250'],
            'sex' => ['required', 'in:male,female'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Relação Cintura-Quadril (RCQ)',
            citation: 'World Health Organization, Waist Circumference and Waist-Hip Ratio: Report of a WHO Expert Consultation, 2008.',
        );
    }

    /**
     * Cortes de risco da OMS (2008) são para adultos; em crianças a distribuição
     * de gordura é avaliada por outros parâmetros antropométricos por idade.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new CinturaQuadrilFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new CinturaQuadrilClassifier;
    }
}
