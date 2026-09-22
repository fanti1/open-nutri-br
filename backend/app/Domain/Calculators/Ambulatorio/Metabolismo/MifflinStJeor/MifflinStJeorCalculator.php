<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\MifflinStJeor;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class MifflinStJeorCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'mifflin-st-jeor';
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
            method: 'Taxa Metabólica Basal (Mifflin-St Jeor)',
            citation: 'Mifflin MD et al., A new predictive equation for resting energy expenditure in healthy individuals, Am J Clin Nutr, 1990.',
        );
    }

    /**
     * Mifflin et al. (1990) estudaram adultos de 19 a 78 anos; não é validada
     * para pacientes pediátricos.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new MifflinStJeorFormula;
    }
}
