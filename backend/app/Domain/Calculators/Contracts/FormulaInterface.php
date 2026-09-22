<?php

namespace App\Domain\Calculators\Contracts;

/**
 * A pure mathematical formula: given validated inputs, returns numeric outputs.
 * Must not know about HTTP, persistence, or clinical interpretation — that is
 * the responsibility of ClassifierInterface and the calculator that composes them.
 */
interface FormulaInterface
{
    /**
     * @param  array<string, mixed>  $inputs
     * @return array<string, float>
     */
    public function compute(array $inputs): array;
}
