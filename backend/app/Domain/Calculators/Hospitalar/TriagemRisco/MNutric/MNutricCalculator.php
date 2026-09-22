<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\MNutric;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class MNutricCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'mnutric';
    }

    public function module(): string
    {
        return 'hospitalar';
    }

    public function category(): string
    {
        return 'triagem_risco';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'age_years' => ['required', 'numeric', 'min:18', 'max:120'],
            'apache_ii' => ['required', 'numeric', 'min:0', 'max:71'],
            'sofa' => ['required', 'numeric', 'min:0', 'max:24'],
            'comorbidities_count' => ['required', 'integer', 'min:0', 'max:20'],
            'days_hospital_to_icu' => ['required', 'numeric', 'min:0', 'max:365'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'mNUTRIC Score (NUTRIC modificado)',
            citation: 'Heyland DK et al., Crit Care, 2011; Rahman A et al., Identifying critically-ill patients who will benefit most from nutritional therapy (modified NUTRIC), Clin Nutr, 2016.',
        );
    }

    /** Desenvolvido e validado em pacientes adultos de UTI. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new MNutricFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new MNutricClassifier;
    }
}
