<?php

namespace App\Domain\Calculators\Support;

use App\Domain\Calculators\Contracts\CalculatorInterface;
use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;

/**
 * Wires a Formula and an optional Classifier together. This is the only place
 * calculate() is implemented — concrete calculators only supply metadata and
 * the two collaborators, keeping each of the three concerns independently testable.
 */
abstract class AbstractCalculator implements CalculatorInterface
{
    abstract protected function formula(): FormulaInterface;

    protected function classifier(): ?ClassifierInterface
    {
        return null;
    }

    public function calculate(array $inputs): CalculationOutcome
    {
        $values = $this->formula()->compute($inputs);
        $classification = $this->classifier()?->classify($values, $inputs);

        return new CalculationOutcome($values, $classification, $this->version());
    }
}
