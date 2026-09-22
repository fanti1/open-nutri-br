<?php

namespace App\Domain\Calculators\Pediatria\CurvasCrescimento;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Classifiers\HeightForAgeClassifier;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Calculators\Pediatria\Support\Who2007IndicatorFormula;
use App\Domain\Calculators\Pediatria\Support\WhoGrowthCalculator;
use App\Domain\Calculators\Support\CalculatorReference;

final class EstaturaIdade5a19Calculator extends WhoGrowthCalculator
{
    public function slug(): string
    {
        return 'oms-estatura-idade-5-19';
    }

    public function inputsSchema(): array
    {
        return [
            ...PediatricInputs::ageSexSchema(228.99, 60),
            'height_cm' => ['required', 'numeric', 'min:80', 'max:230'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Estatura-para-idade (escore-Z, Referência OMS 2007)',
            citation: 'de Onis M et al., Bull World Health Organ, 2007; classificação: Ministério da Saúde, Norma Técnica do SISVAN, 2011.',
        );
    }

    protected function formula(): FormulaInterface
    {
        return new Who2007IndicatorFormula($this->growthReference, 'hfawho2007', false, 229, fn (array $i) => (float) $i['height_cm']);
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new HeightForAgeClassifier;
    }
}
