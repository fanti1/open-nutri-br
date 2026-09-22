<?php

namespace App\Domain\Calculators\Pediatria\ClassificacaoNutricional\Waterlow;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Calculators\Pediatria\Support\WeightForLengthReference;
use App\Domain\Calculators\Pediatria\Support\WhoGrowthCalculator;
use App\Domain\Calculators\Support\CalculatorReference;

final class WaterlowCalculator extends WhoGrowthCalculator
{
    public function slug(): string
    {
        return 'waterlow';
    }

    public function category(): string
    {
        return 'classificacao_nutricional';
    }

    public function inputsSchema(): array
    {
        return [
            ...PediatricInputs::ageSexSchema(59.99),
            'weight_kg' => ['required', 'numeric', 'min:0.5', 'max:60'],
            ...PediatricInputs::lengthSchema(),
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Classificação de Waterlow (déficit atual × crônico)',
            citation: 'Waterlow JC, Classification and definition of protein-calorie malnutrition, BMJ, 1972; medianas de referência: WHO Child Growth Standards, 2006.',
        );
    }

    protected function formula(): FormulaInterface
    {
        return new WaterlowFormula($this->growthReference, new WeightForLengthReference($this->growthReference));
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new WaterlowClassifier;
    }
}
