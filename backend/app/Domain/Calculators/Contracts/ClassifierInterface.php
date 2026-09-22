<?php

namespace App\Domain\Calculators\Contracts;

/**
 * Turns a formula's numeric output into a clinical classification/label.
 * Must not perform any arithmetic itself — that is FormulaInterface's job.
 */
interface ClassifierInterface
{
    /**
     * @param  array<string, float>  $result
     * @param  array<string, mixed>  $inputs
     */
    public function classify(array $result, array $inputs): string;
}
