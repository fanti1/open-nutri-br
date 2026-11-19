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
        return 'v2';
    }

    public function inputsSchema(): array
    {
        return [
            // Fração de ano permitida: a OMS define cortes a partir de 6 meses (0,5 ano).
            'age_years' => ['required', 'numeric', 'min:0.5', 'max:120'],
            'sex' => ['required', 'in:male,female'],
            'pregnant' => ['required', 'boolean'],
            'pregnancy_trimester' => ['required_if:pregnant,true', 'nullable', 'integer', 'in:1,2,3'],
            'hemoglobin_g_dl' => ['required', 'numeric', 'min:1', 'max:25'],
            // Ajustes da OMS (2024), Tabelas 4 e 5; em branco, nenhum ajuste.
            'altitude_m' => ['nullable', 'integer', 'min:0', 'max:4999'],
            'smoking' => ['nullable', 'in:'.implode(',', array_keys(AnemiaCutoffs::SMOKING_ADJUSTMENT_G_L))],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Diagnóstico e gravidade da anemia pela hemoglobina (OMS)',
            citation: 'World Health Organization, Guideline on haemoglobin cutoffs to define anaemia in individuals and populations, Geneva, 2024 (Tabelas 3, 4 e 5).',
        );
    }

    /** A diretriz da OMS cobre de 6 meses a 65 anos, com cortes próprios para gestantes; acima de 65 anos o app usa os cortes de adultos. */
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
