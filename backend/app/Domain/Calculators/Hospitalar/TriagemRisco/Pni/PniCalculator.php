<?php

namespace App\Domain\Calculators\Hospitalar\TriagemRisco\Pni;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class PniCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'pni';
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
            'albumin_g_dl' => ['required', 'numeric', 'min:0', 'max:10'],
            'triceps_skinfold_mm' => ['required', 'numeric', 'min:0', 'max:60'],
            'transferrin_mg_dl' => ['required', 'numeric', 'min:0', 'max:1000'],
            'delayed_hypersensitivity' => ['required', 'in:anergico,menor_5mm,maior_igual_5mm'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'PNI (Índice de Prognóstico Nutricional)',
            citation: 'Buzby GP et al., Prognostic nutritional index in gastrointestinal surgery, Ann Surg, 1980.',
        );
    }

    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new PniFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new PniClassifier;
    }
}
