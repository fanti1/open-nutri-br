<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\NecessidadesProteicas;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class NecessidadesProteicasCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'necessidades-proteicas';
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
        return 'v2';
    }

    public function inputsSchema(): array
    {
        return [
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            // A meta é decisão clínica; a faixa só barra erro de digitação.
            'protein_g_per_kg' => ['required', 'numeric', 'between:0.3,3'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Necessidades Proteicas Diárias (peso × g/kg/dia)',
            citation: 'Meta em g/kg/dia escolhida pelo profissional. Recomendações de referência: Singer P et al., ESPEN guideline on clinical nutrition in the ICU, Clin Nutr, 2023; Gomes F et al., ESPEN guidelines for polymorbid internal medicine patients, Clin Nutr, 2018; Volkert D et al., ESPEN guideline on clinical nutrition and hydration in geriatrics, Clin Nutr, 2019.',
        );
    }

    /**
     * As recomendações de referência (ESPEN) são para adultos e idosos;
     * necessidades proteicas pediátricas por idade ficam para a Fase 3.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new NecessidadesProteicasFormula;
    }
}
