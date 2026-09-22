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
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            // Escrito como string (não Rule::in()) para permanecer serializável em JSON
            // no catálogo de calculadoras consumido pelo app.
            'clinical_context' => ['required', 'in:'.implode(',', array_keys(NecessidadesProteicasFormula::FACTORS_G_PER_KG))],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Necessidades Proteicas Diárias',
            citation: 'ESPEN Guideline on Clinical Nutrition, Clin Nutr, 2016; Institute of Medicine, Dietary Reference Intakes, 2005.',
        );
    }

    /**
     * Os valores de g/kg usados (ESPEN 2016, IOM 2005) são os de referência para
     * adultos; necessidades proteicas pediátricas por idade ficam para a Fase 3.
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
