<?php

namespace App\Domain\Calculators\Pediatria\ClassificacaoNutricional\Gomez;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Calculators\Pediatria\Support\WhoGrowthCalculator;
use App\Domain\Calculators\Support\CalculatorReference;

final class GomezCalculator extends WhoGrowthCalculator
{
    public function slug(): string
    {
        return 'gomez';
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
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Classificação de Gomez (% de adequação peso/idade)',
            citation: 'Gómez F et al., Mortality in second and third degree malnutrition, J Trop Pediatr, 1956; mediana de referência: WHO Child Growth Standards, 2006.',
        );
    }

    protected function formula(): FormulaInterface
    {
        return new GomezFormula($this->growthReference);
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new GomezClassifier;
    }
}
