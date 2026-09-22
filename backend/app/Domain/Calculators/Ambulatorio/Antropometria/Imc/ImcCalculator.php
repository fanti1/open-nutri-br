<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\Imc;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class ImcCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'imc';
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
            method: 'Índice de Massa Corporal (IMC)',
            citation: 'World Health Organization, Obesity: Preventing and Managing the Global Epidemic, WHO Technical Report Series 894, 2000.',
        );
    }

    /**
     * IMC/WHO 2000 classifica adultos; crianças usam IMC-por-idade (curvas WHO,
     * Fase 3), por isso este método não é oferecido para o público infantil.
     */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new ImcFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new ImcClassifier;
    }
}
