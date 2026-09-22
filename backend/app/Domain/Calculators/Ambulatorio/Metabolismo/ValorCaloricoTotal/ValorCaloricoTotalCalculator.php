<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\ValorCaloricoTotal;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class ValorCaloricoTotalCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'valor-calorico-total';
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
            'bmr_kcal' => ['required', 'numeric', 'min:200', 'max:6000'],
            // Escrito como string (não Rule::in()) para permanecer serializável em JSON
            // no catálogo de calculadoras consumido pelo app.
            'activity_level' => ['required', 'in:'.implode(',', array_keys(ValorCaloricoTotalFormula::ACTIVITY_FACTORS))],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Valor Calórico Total (VCT)',
            citation: 'FAO/WHO/UNU, Human Energy Requirements: Report of a Joint Expert Consultation, 2001.',
        );
    }

    /**
     * Os fatores de atividade da FAO/WHO/UNU (2001) usados aqui são os de adultos.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new ValorCaloricoTotalFormula;
    }
}
