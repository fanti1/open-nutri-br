<?php

namespace App\Domain\Calculators\Bioquimica\FuncaoRenal\CockcroftGault;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class CockcroftGaultCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'cockcroft-gault';
    }

    public function module(): string
    {
        return 'bioquimica';
    }

    public function category(): string
    {
        return 'funcao_renal';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'creatinine_mg_dl' => ['required', 'numeric', 'min:0.1', 'max:30'],
            'age_years' => ['required', 'integer', 'min:18', 'max:120'],
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            'sex' => ['required', 'in:male,female'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Clearance de creatinina estimado (Cockcroft-Gault)',
            citation: 'Cockcroft DW, Gault MH, Prediction of creatinine clearance from serum creatinine, Nephron, 1976.',
        );
    }

    /** Derivada de homens adultos hospitalizados; não se aplica a crianças. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new CockcroftGaultFormula;
    }
}
