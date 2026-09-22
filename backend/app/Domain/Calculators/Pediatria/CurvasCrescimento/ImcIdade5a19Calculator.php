<?php

namespace App\Domain\Calculators\Pediatria\CurvasCrescimento;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Classifiers\SchoolAgeBmiClassifier;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Calculators\Pediatria\Support\Who2007IndicatorFormula;
use App\Domain\Calculators\Pediatria\Support\WhoGrowthCalculator;
use App\Domain\Calculators\Support\CalculatorReference;

final class ImcIdade5a19Calculator extends WhoGrowthCalculator
{
    public function slug(): string
    {
        return 'oms-imc-idade-5-19';
    }

    public function inputsSchema(): array
    {
        return [
            ...PediatricInputs::ageSexSchema(228.99, 60),
            'weight_kg' => ['required', 'numeric', 'min:5', 'max:250'],
            'height_cm' => ['required', 'numeric', 'min:80', 'max:230'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'IMC-para-idade (escore-Z, Referência OMS 2007)',
            citation: 'de Onis M et al., Development of a WHO growth reference for school-aged children and adolescents, Bull World Health Organ, 2007; classificação: Ministério da Saúde, Norma Técnica do SISVAN, 2011.',
        );
    }

    protected function formula(): FormulaInterface
    {
        return new Who2007IndicatorFormula(
            $this->growthReference,
            'bfawho2007',
            true,
            229,
            fn (array $i) => (float) $i['weight_kg'] / (((float) $i['height_cm'] / 100) ** 2),
        );
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new SchoolAgeBmiClassifier;
    }
}
