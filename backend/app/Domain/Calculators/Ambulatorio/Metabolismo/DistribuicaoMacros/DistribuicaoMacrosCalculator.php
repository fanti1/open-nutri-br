<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\DistribuicaoMacros;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class DistribuicaoMacrosCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'distribuicao-macros';
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
            'total_kcal' => ['required', 'numeric', 'min:200', 'max:6000'],
            // Faixas AMDR (IOM, 2005): cada percentual é validado dentro da própria faixa.
            'carb_percent' => ['required', 'numeric', 'between:45,65'],
            'protein_percent' => ['required', 'numeric', 'between:10,35'],
            'fat_percent' => ['required', 'numeric', 'between:20,35'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Distribuição de Macronutrientes (AMDR)',
            citation: 'Institute of Medicine, Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Protein and Amino Acids (AMDR), 2005.',
        );
    }

    /**
     * As faixas AMDR usadas aqui são as de adultos/adolescentes; crianças de 1–3
     * anos têm faixa de lipídios diferente (30–40%) na tabela do IOM, não coberta
     * por esta versão.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new DistribuicaoMacrosFormula;
    }
}
