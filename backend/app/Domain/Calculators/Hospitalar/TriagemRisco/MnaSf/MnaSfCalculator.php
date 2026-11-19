<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\MnaSf;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class MnaSfCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'mna-sf';
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
            'food_intake_score' => ['required', 'integer', 'between:0,2'],
            'weight_loss_score' => ['required', 'integer', 'between:0,3'],
            'mobility_score' => ['required', 'integer', 'between:0,2'],
            'psychological_stress_score' => ['required', 'integer', 'in:0,2'],
            'neuropsychological_score' => ['required', 'integer', 'between:0,2'],
            'bmi_score' => ['required', 'integer', 'between:0,3'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'MNA-SF (Mini Nutritional Assessment — Short Form)',
            citation: 'Kaiser MJ et al., Validation of the Mini Nutritional Assessment short-form (MNA-SF): a practical tool for identification of nutritional status, J Nutr Health Aging, 2009 (três categorias: 12–14 normal, 8–11 risco, 0–7 desnutrido); Rubenstein LZ et al., J Gerontol A Biol Sci Med Sci, 2001 (versão original, dois grupos); formulário oficial MNA-SF, Nestlé, revisão 2009.',
        );
    }

    /** Desenvolvida e validada especificamente para triagem geriátrica. */
    public function lifeStages(): array
    {
        return [LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new MnaSfFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new MnaSfClassifier;
    }
}
