<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\Cunningham;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class CunninghamCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'cunningham';
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
            'body_fat_percent' => ['required', 'numeric', 'min:2', 'max:70'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Taxa metabólica basal pela massa magra (Cunningham)',
            citation: 'Cunningham JJ, A reanalysis of the factors influencing basal metabolic rate in normal adults, Am J Clin Nutr, 1980.',
        );
    }

    /** Reanálise dos adultos do estudo de Harris & Benedict (1919). */
    public function lifeStages(): array
    {
        return [LifeStage::Adult];
    }

    protected function formula(): FormulaInterface
    {
        return new CunninghamFormula;
    }
}
