<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\PerdaDePeso;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class PerdaDePesoCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'perda-de-peso';
    }

    public function module(): string
    {
        return 'ambulatorio';
    }

    public function category(): string
    {
        return 'antropometria';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'usual_weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            'current_weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            'period_days' => ['required', 'numeric', 'min:1', 'max:365'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: '% de Perda de Peso',
            citation: 'Blackburn GL et al., Nutritional and metabolic assessment of the hospitalized patient, JPEN, 1977.',
        );
    }

    /**
     * Os limiares de Blackburn (1977) foram derivados em pacientes adultos
     * hospitalizados; perda de peso infantil é avaliada por curvas de crescimento.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new PerdaDePesoFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new PerdaDePesoClassifier;
    }
}
