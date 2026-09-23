<?php

namespace App\Domain\Calculators\Pediatria\GastoEnergetico\Schofield;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class SchofieldCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'schofield';
    }

    /**
     * Equações por faixa etária de 0 a 60+ anos (base das recomendações
     * FAO/OMS/UNU): exibida em Consultório → Metabolismo para todos os públicos.
     */
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
            'age_years' => ['required', 'numeric', 'min:0', 'max:120'],
            'sex' => ['required', 'in:male,female'],
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:300'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Taxa Metabólica Basal (Schofield, por peso)',
            citation: 'Schofield WN, Hum Nutr Clin Nutr, 1985; coeficientes conforme FAO/WHO/UNU, Human Energy Requirements, 2004, Tabela 5.2.',
        );
    }

    /** Schofield publicou equações para todas as faixas etárias (< 3 anos a ≥ 60 anos). */
    public function lifeStages(): array
    {
        return [LifeStage::Child, LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new SchofieldFormula;
    }
}
