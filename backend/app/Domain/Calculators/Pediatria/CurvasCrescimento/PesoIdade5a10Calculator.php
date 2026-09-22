<?php

namespace App\Domain\Calculators\Pediatria\CurvasCrescimento;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Classifiers\WeightForAgeClassifier;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Calculators\Pediatria\Support\Who2007IndicatorFormula;
use App\Domain\Calculators\Pediatria\Support\WhoGrowthCalculator;
use App\Domain\Calculators\Support\CalculatorReference;

/** A OMS não publica peso-para-idade após os 10 anos (não distingue ganho de estatura de ganho de massa na puberdade). */
final class PesoIdade5a10Calculator extends WhoGrowthCalculator
{
    public function slug(): string
    {
        return 'oms-peso-idade-5-10';
    }

    public function inputsSchema(): array
    {
        return [
            ...PediatricInputs::ageSexSchema(120.99, 60),
            'weight_kg' => ['required', 'numeric', 'min:5', 'max:150'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Peso-para-idade (escore-Z, Referência OMS 2007, 5–10 anos)',
            citation: 'de Onis M et al., Bull World Health Organ, 2007; classificação: Ministério da Saúde, Norma Técnica do SISVAN, 2011.',
        );
    }

    protected function formula(): FormulaInterface
    {
        return new Who2007IndicatorFormula($this->growthReference, 'wfawho2007', true, 121, fn (array $i) => (float) $i['weight_kg']);
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new WeightForAgeClassifier;
    }
}
