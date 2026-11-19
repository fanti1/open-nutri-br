<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\IngestaoLiquidos;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class IngestaoLiquidosCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'ingestao-liquidos';
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
        return 'v2';
    }

    public function inputsSchema(): array
    {
        return [
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            // A meta é decisão clínica; a faixa só barra erro de digitação.
            'ml_per_kg' => ['required', 'numeric', 'between:10,60'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Necessidade Hídrica Diária (peso × mL/kg/dia)',
            citation: 'Volume em mL/kg/dia escolhido pelo profissional. Recomendação de referência para idosos: Volkert D et al., ESPEN guideline on clinical nutrition and hydration in geriatrics, Clin Nutr, 2019.',
        );
    }

    /**
     * Para adultos e idosos; a necessidade hídrica pediátrica usa Holliday-Segar.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new IngestaoLiquidosFormula;
    }
}
