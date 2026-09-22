<?php

namespace App\Domain\Calculators\Support;

/**
 * Immutable result of running a calculator: the raw numeric output(s),
 * the clinical classification (when applicable), and which formula version produced it.
 */
final class CalculationOutcome
{
    /**
     * @param  array<string, float>  $values
     */
    public function __construct(
        public readonly array $values,
        public readonly ?string $classification,
        public readonly string $formulaVersion,
    ) {}

    /**
     * @return array{values: array<string, float>, classification: ?string, formula_version: string}
     */
    public function toArray(): array
    {
        return [
            'values' => $this->values,
            'classification' => $this->classification,
            'formula_version' => $this->formulaVersion,
        ];
    }
}
