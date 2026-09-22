<?php

namespace App\Domain\Calculators\Hospitalar\SuporteNutricional\DietaEnteral;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class DietaEnteralCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'dieta-enteral';
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
            'target_volume_ml' => ['required', 'numeric', 'min:1', 'max:5000'],
            'infusion_duration_hours' => ['required', 'numeric', 'min:0.5', 'max:24'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Dieta Enteral (taxa de infusão)',
            citation: 'ASPEN/BRASPEN Guidelines for Enteral Nutrition.',
        );
    }

    /** Cálculo aritmético (volume/tempo); a escolha do volume/duração-alvo segue protocolos adulto/pediátrico distintos. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new DietaEnteralFormula;
    }
}
