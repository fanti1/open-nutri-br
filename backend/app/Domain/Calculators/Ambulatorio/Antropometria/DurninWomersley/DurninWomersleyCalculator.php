<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\DurninWomersley;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class DurninWomersleyCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'durnin-womersley';
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
            'sex' => ['required', 'in:male,female'],
            'age_years' => ['required', 'integer', 'min:17', 'max:72'],
            'skinfold_biceps_mm' => ['required', 'numeric', 'min:1', 'max:100'],
            'skinfold_triceps_mm' => ['required', 'numeric', 'min:1', 'max:100'],
            'skinfold_subscapular_mm' => ['required', 'numeric', 'min:1', 'max:100'],
            'skinfold_suprailiac_mm' => ['required', 'numeric', 'min:1', 'max:100'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: '% de gordura por 4 dobras cutâneas (Durnin-Womersley) e equação de Siri',
            citation: 'Durnin JVGA, Womersley J, Body fat assessed from total body density and its estimation from skinfold thickness: measurements on 481 men and women aged from 16 to 72 years, Br J Nutr, 1974; Siri WE, 1961.',
        );
    }

    /** Amostra de 16 a 72 anos, com coeficientes próprios a partir dos 50. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new DurninWomersleyFormula;
    }
}
