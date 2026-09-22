<?php

namespace App\Domain\Calculators\Pediatria\CurvasCrescimento;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Classifiers\HeadCircumferenceClassifier;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Calculators\Pediatria\Support\WhoAgeIndicatorFormula;
use App\Domain\Calculators\Pediatria\Support\WhoGrowthCalculator;
use App\Domain\Calculators\Support\CalculatorReference;

final class PerimetroCefalico0a5Calculator extends WhoGrowthCalculator
{
    public function slug(): string
    {
        return 'oms-perimetro-cefalico-0-5';
    }

    public function inputsSchema(): array
    {
        return [
            ...PediatricInputs::ageSexSchema(59.99),
            'head_circumference_cm' => ['required', 'numeric', 'min:20', 'max:65'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Perímetro cefálico-para-idade (escore-Z, Padrões OMS 2006)',
            citation: 'WHO Multicentre Growth Reference Study Group, WHO Child Growth Standards: head circumference-for-age, 2007; classificação: WHO, Zika virus exposure in utero guideline, 2016.',
        );
    }

    protected function formula(): FormulaInterface
    {
        return new WhoAgeIndicatorFormula($this->growthReference, 'hcanthro', false, fn (array $i) => (float) $i['head_circumference_cm']);
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new HeadCircumferenceClassifier;
    }
}
