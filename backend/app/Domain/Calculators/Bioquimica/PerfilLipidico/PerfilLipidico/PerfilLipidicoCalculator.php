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
        return 'v2';
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
            method: 'LDL-c (Martin/Hopkins), não-HDL-c e valores referenciais desejáveis',
            citation: 'SBC, Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose – 2025, Arq Bras Cardiol, 2025 (Martin/Hopkins para todos; valores desejáveis iguais aos de 2017); Martin SS et al., JAMA, 2013;310(19):2061-2068; tabela de fatores: Faludi AA et al., Atualização da Diretriz Brasileira de Dislipidemias – 2017, Tabela 1.',
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
