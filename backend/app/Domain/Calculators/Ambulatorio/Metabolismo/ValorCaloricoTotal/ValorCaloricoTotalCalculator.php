<?php

namespace App\Domain\Calculators\Ambulatorio\Metabolismo\ValorCaloricoTotal;

use App\Domain\Calculators\Contracts\ClassifierInterface;
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
        return 'v2';
    }

    public function inputsSchema(): array
    {
        return [
            'bmr_kcal' => ['required', 'numeric', 'min:200', 'max:6000'],
            // Faixa de PAL da Tabela 5.3 (valores acima de 2,40 são difíceis de manter por muito tempo).
            'pal' => ['required', 'numeric', 'between:1.4,2.4'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Valor Calórico Total (VCT) = TMB × PAL',
            citation: 'FAO/WHO/UNU, Human Energy Requirements: Report of a Joint FAO/WHO/UNU Expert Consultation (2001), FAO Food and Nutrition Technical Report Series 1, 2004 — Tabela 5.3.',
        );
    }

    /**
     * A classificação de PAL da FAO/WHO/UNU (Tabela 5.3) é a de adultos.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new ValorCaloricoTotalFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new ValorCaloricoTotalClassifier;
    }
}
