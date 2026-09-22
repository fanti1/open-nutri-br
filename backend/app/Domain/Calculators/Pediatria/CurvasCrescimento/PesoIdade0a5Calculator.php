<?php

namespace App\Domain\Calculators\Pediatria\CurvasCrescimento;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Classifiers\WeightForAgeClassifier;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Calculators\Pediatria\Support\WhoAgeIndicatorFormula;
use App\Domain\Calculators\Pediatria\Support\WhoGrowthCalculator;
use App\Domain\Calculators\Support\CalculatorReference;

final class PesoIdade0a5Calculator extends WhoGrowthCalculator
{
    public function slug(): string
    {
        return 'oms-peso-idade-0-5';
    }

    public function inputsSchema(): array
    {
        return [
            ...PediatricInputs::ageSexSchema(59.99),
            'weight_kg' => ['required', 'numeric', 'min:0.5', 'max:60'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Peso-para-idade (escore-Z, Padrões OMS 2006)',
            citation: 'WHO Multicentre Growth Reference Study Group, WHO Child Growth Standards, 2006; classificação: Ministério da Saúde, Norma Técnica do SISVAN, 2011.',
        );
    }

    protected function formula(): FormulaInterface
    {
        return new WhoAgeIndicatorFormula($this->growthReference, 'weianthro', true, fn (array $i) => (float) $i['weight_kg']);
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new WeightForAgeClassifier;
    }
}
