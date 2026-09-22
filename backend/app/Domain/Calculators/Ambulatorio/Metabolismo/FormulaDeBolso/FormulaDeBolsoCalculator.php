<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\FormulaDeBolso;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class FormulaDeBolsoCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'formula-de-bolso';
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
            // 20-35 kcal/kg cobre a faixa recomendada pela ASPEN conforme objetivo clínico.
            'factor_kcal_per_kg' => ['required', 'numeric', 'min:20', 'max:35'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Fórmula de Bolso (estimativa rápida de GET)',
            citation: 'McClave SA et al., ASPEN Clinical Guidelines: Nutrition Support Therapy, JPEN, 2016.',
        );
    }

    /**
     * A faixa de 20–35 kcal/kg das diretrizes ASPEN é voltada a pacientes adultos.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new FormulaDeBolsoFormula;
    }
}
