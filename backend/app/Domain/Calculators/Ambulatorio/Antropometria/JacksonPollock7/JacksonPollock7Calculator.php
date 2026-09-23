<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\JacksonPollock7;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class JacksonPollock7Calculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'jackson-pollock-7';
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
        $schema = [
            'sex' => ['required', 'in:male,female'],
            'age_years' => ['required', 'integer', 'min:18', 'max:61'],
        ];

        foreach (JacksonPollock7Formula::SITES as $site) {
            $schema[$site] = ['required', 'numeric', 'min:1', 'max:100'];
        }

        return $schema;
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: '% de gordura por 7 dobras cutâneas (Jackson-Pollock) e equação de Siri',
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
        return new JacksonPollock7Formula;
    }
}
