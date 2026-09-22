<?php

namespace App\Domain\Calculators\Bioquimica\Hematologia\AnemiaOms;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class AnemiaOmsCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'anemia-oms';
    }

    public function module(): string
    {
        return 'bioquimica';
    }

    public function category(): string
    {
        return 'hematologia';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            // Fração de ano permitida: a OMS define cortes a partir de 6 meses (0,5 ano).
            'age_years' => ['required', 'numeric', 'min:0.5', 'max:120'],
            'sex' => ['required', 'in:male,female'],
            'pregnant' => ['required', 'boolean'],
            'hemoglobin_g_dl' => ['required', 'numeric', 'min:1', 'max:25'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Diagnóstico e gravidade da anemia pela hemoglobina (OMS)',
            citation: 'World Health Organization, Haemoglobin concentrations for the diagnosis of anaemia and assessment of severity, WHO/NMH/NHD/MNM/11.1, 2011.',
        );
    }

    /** A tabela da OMS cobre de 6 meses a adultos, com cortes próprios para gestantes. */
    public function lifeStages(): array
    {
        return [LifeStage::Child, LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new AnemiaOmsFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new AnemiaOmsClassifier;
    }
}
