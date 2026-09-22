<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\Curreri;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class CurreriCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'curreri';
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
            'burned_body_surface_percent' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Curreri (necessidade calórica em queimados)',
            citation: 'Curreri PW et al., Dietary requirements of patients with major burns, J Trauma, 1974.',
        );
    }

    /** Derivada de dados de queimados adultos; queimaduras pediátricas usam a fórmula de Galveston. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new CurreriFormula;
    }
}
