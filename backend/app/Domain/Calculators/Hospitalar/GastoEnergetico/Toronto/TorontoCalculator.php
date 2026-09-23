<?php

namespace App\Domain\Calculators\Hospitalar\GastoEnergetico\Toronto;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class TorontoCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'toronto';
    }

    public function module(): string
    {
        return 'hospitalar';
    }

    public function category(): string
    {
        return 'gasto_energetico';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'burned_body_surface_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'caloric_intake_kcal' => ['required', 'numeric', 'min:0', 'max:10000'],
            'harris_benedict_kcal' => ['required', 'numeric', 'min:300', 'max:5000'],
            'temperature_c' => ['required', 'numeric', 'min:33', 'max:43'],
            'post_burn_day' => ['required', 'integer', 'min:0', 'max:365'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Gasto energético de repouso em queimados (Fórmula de Toronto)',
            citation: 'Allard JP et al., Validation of a new formula for calculating the energy requirements of burn patients, JPEN, 1990.',
        );
    }

    /** Derivada e validada em adultos queimados. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new TorontoFormula;
    }
}
