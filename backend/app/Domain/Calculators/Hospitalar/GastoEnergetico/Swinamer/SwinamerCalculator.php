<?php

namespace App\Domain\Calculators\Hospitalar\GastoEnergetico\Swinamer;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class SwinamerCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'swinamer';
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
            'body_surface_area_m2' => ['required', 'numeric', 'min:0.5', 'max:3.5'],
            'age_years' => ['required', 'integer', 'min:18', 'max:120'],
            'temperature_c' => ['required', 'numeric', 'min:33', 'max:43'],
            'respiratory_rate' => ['required', 'numeric', 'min:4', 'max:60'],
            'tidal_volume_l' => ['required', 'numeric', 'min:0.1', 'max:2'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Gasto energético em ventilação mecânica (Swinamer)',
            citation: 'Swinamer DL et al., Predictive equation for assessing energy expenditure in mechanically ventilated critically ill patients, Crit Care Med, 1990.',
        );
    }

    /** 112 adultos ventilados (idade 50 ± 20 anos). */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new SwinamerFormula;
    }
}
