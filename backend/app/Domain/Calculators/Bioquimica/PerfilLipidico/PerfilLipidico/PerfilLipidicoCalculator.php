<?php

namespace App\Domain\Calculators\Bioquimica\PerfilLipidico\PerfilLipidico;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class PerfilLipidicoCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'perfil-lipidico';
    }

    public function module(): string
    {
        return 'bioquimica';
    }

    public function category(): string
    {
        return 'perfil_lipidico';
    }

    public function version(): string
    {
        return 'v1';
    }

    public function inputsSchema(): array
    {
        return [
            'total_cholesterol_mg_dl' => ['required', 'numeric', 'min:20', 'max:1500'],
            'hdl_mg_dl' => ['required', 'numeric', 'min:1', 'max:300'],
            'triglycerides_mg_dl' => ['required', 'numeric', 'min:10', 'max:10000'],
            'fasting' => ['required', 'boolean'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'LDL-c (Friedewald), não-HDL-c e valores referenciais desejáveis',
            citation: 'Faludi AA et al., Atualização da Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose – 2017, Arq Bras Cardiol, 2017; Friedewald WT, Levy RI, Fredrickson DS, Clin Chem, 1972.',
        );
    }

    /** Os valores referenciais usados são os da diretriz para adultos (> 20 anos); crianças têm tabela própria. */
    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new PerfilLipidicoFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new PerfilLipidicoClassifier;
    }
}
