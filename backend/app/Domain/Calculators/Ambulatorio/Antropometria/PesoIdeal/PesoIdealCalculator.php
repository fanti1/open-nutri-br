<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\PesoIdeal;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class PesoIdealCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'peso-ideal';
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
            'height_m' => ['required', 'numeric', 'min:0.3', 'max:2.5'],
            'sex' => ['required', 'in:male,female'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Peso Ideal (fórmula de Devine)',
            citation: 'Devine BJ, Gentamicin therapy, Drug Intell Clin Pharm, 1974;8:650-655.',
        );
    }

    /**
     * Devine (1974) foi derivada de dados de adultos; peso ideal pediátrico usa
     * curvas de crescimento por idade (Fase 3), não esta equação.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new PesoIdealFormula;
    }
}
