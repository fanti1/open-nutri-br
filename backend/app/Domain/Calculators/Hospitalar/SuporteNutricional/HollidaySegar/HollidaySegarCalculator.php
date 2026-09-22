<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\HollidaySegar;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class HollidaySegarCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'holliday-segar';
    }

    public function module(): string
    {
        return 'hospitalar';
    }

    public function category(): string
    {
        return 'suporte_nutricional';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Necessidade Hídrica (Holliday-Segar)',
            citation: 'Holliday MA, Segar WE, The maintenance need for water in parenteral fluid therapy, Pediatrics, 1957.',
        );
    }

    /**
     * Método clássico derivado em crianças (1957), mas amplamente estendido e
     * usado também para necessidade hídrica de manutenção em adultos hospitalizados.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Child, LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new HollidaySegarFormula;
    }
}
