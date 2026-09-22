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
            method: 'Necessidade Hídrica Diária',
            citation: 'ESPEN Guideline on Home Enteral Nutrition, Clin Nutr.',
        );
    }

    /**
     * A faixa de 30–35 mL/kg é a recomendação ESPEN para adultos; necessidade
     * hídrica pediátrica usa Holliday-Segar (Fase 2/3).
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
