<?php

namespace App\Domain\Calculators\Pediatria\GastoEnergetico\NecessidadeEnergeticaInfantil;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class NecessidadeEnergeticaInfantilCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'necessidade-energetica-infantil';
    }

    public function module(): string
    {
        return 'pediatria';
    }

    public function category(): string
    {
        return 'gasto_energetico';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            // Tabelas cobrem de 1 a < 18 anos.
            'age_years' => ['required', 'numeric', 'min:1', 'max:17.99'],
            'sex' => ['required', 'in:male,female'],
            'weight_kg' => ['required', 'numeric', 'min:5', 'max:200'],
            'activity_level' => ['required', 'in:leve,moderada,intensa'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Necessidade Energética de Crianças e Adolescentes (1–18 anos)',
            citation: 'FAO/WHO/UNU, Human Energy Requirements: Report of a Joint Expert Consultation, 2004, Tabelas 4.5 e 4.6.',
        );
    }

    public function lifeStages(): array
    {
        return [LifeStage::Child];
    }

    protected function formula(): FormulaInterface
    {
        return new NecessidadeEnergeticaInfantilFormula;
    }
}
