<?php

namespace App\Domain\Calculators\Contracts;

use App\Domain\Calculators\Support\CalculationOutcome;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

/**
 * A calculator is metadata + orchestration only: it identifies itself (slug/module/
 * category/version), declares its input contract, cites its scientific reference,
 * and composes a FormulaInterface with an optional ClassifierInterface to produce
 * a CalculationOutcome. It must never contain arithmetic or classification logic
 * itself — see AbstractCalculator.
 */
interface CalculatorInterface
{
    public function slug(): string;

    public function module(): string;

    public function category(): string;

    /**
     * Bumped whenever the formula changes in a way that would alter previously
     * stored results. Past CalculationResult rows keep the version they were
     * computed with and are never recalculated retroactively.
     */
    public function version(): string;

    /**
     * Laravel validation rules for the raw inputs this calculator accepts.
     *
     * @return array<string, string|array<int, mixed>>
     */
    public function inputsSchema(): array;

    public function reference(): CalculatorReference;

    /**
     * The life stages this exact formula/version is scientifically validated for,
     * per the population studied in its source reference — e.g. Mifflin-St Jeor
     * was derived from adults and must not be offered for a pediatric patient.
     *
     * @return array<int, LifeStage>
     */
    public function lifeStages(): array;

    /**
     * @param  array<string, mixed>  $inputs
     */
    public function calculate(array $inputs): CalculationOutcome;
}
