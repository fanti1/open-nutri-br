<?php

namespace App\Domain\Calculators\Bioquimica\FuncaoRenal\CkdEpi2021;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class CkdEpi2021Calculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'ckd-epi-2021';
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
            'sex' => ['required', 'in:male,female'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Taxa de filtração glomerular estimada — CKD-EPI 2021 (creatinina, sem raça)',
            citation: 'Inker LA et al., New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race, N Engl J Med, 2021; categorias: KDIGO 2012 Clinical Practice Guideline for the Evaluation and Management of CKD, Kidney Int Suppl, 2013.',
        );
    }

    /** Derivada e validada em adultos (≥ 18 anos); crianças usam a equação de Schwartz. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new CkdEpi2021Formula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new CkdEpi2021Classifier;
    }
}
