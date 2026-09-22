<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\HarrisBenedict;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class HarrisBenedictCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'harris-benedict';
    }

    public function module(): string
    {
        return 'ambulatorio';
    }

    public function category(): string
    {
        return 'metabolismo';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            'height_cm' => ['required', 'numeric', 'min:30', 'max:250'],
            'age_years' => ['required', 'integer', 'min:1', 'max:120'],
            'sex' => ['required', 'in:male,female'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Taxa Metabólica Basal (Harris-Benedict revisado)',
            citation: 'Roza AM, Shizgal HM, The Harris Benedict equation reevaluated, Am J Clin Nutr, 1984.',
        );
    }

    /**
     * Roza & Shizgal (1984) recalcularam a equação original de Harris-Benedict
     * (1919) a partir de uma coorte adulta; gasto energético infantil usa
     * Schofield (Fase 3).
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new HarrisBenedictFormula;
    }
}
