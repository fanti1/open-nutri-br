<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\IndiceConicidade;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class IndiceConicidadeCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'indice-conicidade';
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
            'waist_cm' => ['required', 'numeric', 'min:20', 'max:300'],
            'weight_kg' => ['required', 'numeric', 'min:1', 'max:500'],
            'height_cm' => ['required', 'numeric', 'min:50', 'max:250'],
            'sex' => ['required', 'in:male,female'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Índice de conicidade (adiposidade abdominal)',
            citation: 'Valdez R, A simple model-based index of abdominal adiposity, J Clin Epidemiol, 1991; pontos de corte: Pitanga FJG, Lessa I, Sensibilidade e especificidade do índice de conicidade como discriminador do risco coronariano de adultos em Salvador, Brasil, Rev Bras Epidemiol, 2004.',
        );
    }

    /** Pontos de corte derivados de adultos de 30 a 74 anos. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new IndiceConicidadeFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new IndiceConicidadeClassifier;
    }
}
