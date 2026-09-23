<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\RelacaoCinturaEstatura;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class RelacaoCinturaEstaturaCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'relacao-cintura-estatura';
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
            'waist_cm' => ['required', 'numeric', 'min:20', 'max:300'],
            'height_cm' => ['required', 'numeric', 'min:50', 'max:250'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Relação cintura-estatura (adiposidade central)',
            citation: 'NICE, Overweight and obesity management (NG246), 2025; Ashwell M, Gunn P, Gibson S, Waist-to-height ratio is a better screening tool than waist circumference and BMI for adult cardiometabolic risk factors, Obes Rev, 2012.',
        );
    }

    /** As faixas do NICE são para adultos (de qualquer idade adulta) com IMC abaixo de 35. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new RelacaoCinturaEstaturaFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new RelacaoCinturaEstaturaClassifier;
    }
}
