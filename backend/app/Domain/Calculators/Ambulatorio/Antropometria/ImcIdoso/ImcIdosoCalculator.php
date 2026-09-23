<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\ImcIdoso;

use App\Domain\Calculators\Ambulatorio\Antropometria\Imc\ImcFormula;
use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class ImcIdosoCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'imc-idoso';
    }

    public function module(): string
    {
        return 'ambulatorio';
    }

    public function category(): string
    {
        return 'antropometria';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            'height_m' => ['required', 'numeric', 'min:0.3', 'max:2.5'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Índice de Massa Corporal do idoso (pontos de corte de Lipschitz)',
            citation: 'Lipschitz DA, Screening for nutritional status in the elderly, Prim Care, 1994; adotado pelo Ministério da Saúde no SISVAN para pessoas com 60 anos ou mais.',
        );
    }

    public function lifeStages(): array
    {
        return [LifeStage::Elderly];
    }

    /** Mesma conta do IMC; muda só a interpretação. */
    protected function formula(): FormulaInterface
    {
        return new ImcFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new ImcIdosoClassifier;
    }
}
