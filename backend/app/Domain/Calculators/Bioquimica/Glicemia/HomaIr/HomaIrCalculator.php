<?php

namespace App\Domain\Calculators\Bioquimica\Glicemia\HomaIr;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class HomaIrCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'homa-ir';
    }

    public function module(): string
    {
        return 'bioquimica';
    }

    public function category(): string
    {
        return 'glicemia';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'fasting_glucose_mg_dl' => ['required', 'numeric', 'min:20', 'max:1000'],
            'fasting_insulin_uui_ml' => ['required', 'numeric', 'min:0.1', 'max:500'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'HOMA-IR (Homeostasis Model Assessment)',
            citation: 'Matthews DR et al., Homeostasis model assessment: insulin resistance and beta-cell function from fasting plasma glucose and insulin concentrations in man, Diabetologia, 1985; ponto de corte brasileiro: Geloneze B et al., BRAMS, Diabetes Res Clin Pract, 2006.',
        );
    }

    /** O ponto de corte 2,71 vem de adultos brasileiros (BRAMS); crianças têm cortes próprios. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new HomaIrFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new HomaIrClassifier;
    }
}
