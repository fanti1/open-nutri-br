<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\JacksonPollock3;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class JacksonPollock3Calculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'jackson-pollock-3';
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

    /** As dobras dependem do sexo; o app mostra só as que se aplicam (required_if). */
    public function inputsSchema(): array
    {
        $skinfold = ['nullable', 'numeric', 'min:1', 'max:100'];

        return [
            'sex' => ['required', 'in:male,female'],
            'age_years' => ['required', 'integer', 'min:18', 'max:61'],
            'skinfold_chest_mm' => ['required_if:sex,male', ...$skinfold],
            'skinfold_abdominal_mm' => ['required_if:sex,male', ...$skinfold],
            'skinfold_triceps_mm' => ['required_if:sex,female', ...$skinfold],
            'skinfold_suprailiac_mm' => ['required_if:sex,female', ...$skinfold],
            'skinfold_thigh_mm' => ['required', 'numeric', 'min:1', 'max:100'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: '% de gordura por 3 dobras cutâneas (Jackson-Pollock) e equação de Siri',
            citation: 'Jackson AS, Pollock ML, Generalized equations for predicting body density of men, Br J Nutr, 1978; Jackson AS, Pollock ML, Ward A, Generalized equations for predicting body density of women, Med Sci Sports Exerc, 1980; Siri WE, 1961.',
        );
    }

    /** Amostras de 18 a 61 anos (homens) e 18 a 55 anos (mulheres). */
    public function lifeStages(): array
    {
        return [LifeStage::Adult];
    }

    protected function formula(): FormulaInterface
    {
        return new JacksonPollock3Formula;
    }
}
