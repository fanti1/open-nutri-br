<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\PgSgaSf;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class PgSgaSfCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'pg-sga-sf';
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
            'box1_weight_history_score' => ['required', 'numeric', 'min:0', 'max:4'],
            'box2_food_intake_score' => ['required', 'numeric', 'min:0', 'max:4'],
            'box3_symptoms_score' => ['required', 'numeric', 'min:0', 'max:24'],
            'box4_activity_function_score' => ['required', 'numeric', 'min:0', 'max:4'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'PG-SGA SF (Patient-Generated SGA — Short Form)',
            citation: 'Ottery FD, Nutrition, 1996; Bauer J, Capra S, Ferguson M, Eur J Clin Nutr, 2002 (validação da forma resumida).',
        );
    }

    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new PgSgaSfFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new PgSgaSfClassifier;
    }
}
