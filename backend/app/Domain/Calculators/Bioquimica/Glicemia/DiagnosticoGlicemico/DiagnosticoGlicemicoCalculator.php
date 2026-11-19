<?php

namespace App\Domain\Calculators\Bioquimica\Glicemia\DiagnosticoGlicemico;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\CalculatorReference;
use App\Domain\Calculators\Support\LifeStage;

final class DiagnosticoGlicemicoCalculator extends AbstractCalculator
{
    public function slug(): string
    {
        return 'glicemia-diagnostico';
    }

    public function module(): string
    {
        return 'bioquimica';
    }

    public function category(): string
    {
        return 'glicemia';
    }

    public function version(): string
    {
        return 'v1';
    }

    /** Cada exame é opcional, mas ao menos um é obrigatório. */
    public function inputsSchema(): array
    {
        return [
            'fasting_glucose_mg_dl' => ['nullable', 'required_without_all:hba1c_percent,ogtt_2h_mg_dl,ogtt_1h_mg_dl', 'numeric', 'min:20', 'max:1000'],
            'hba1c_percent' => ['nullable', 'required_without_all:fasting_glucose_mg_dl,ogtt_2h_mg_dl,ogtt_1h_mg_dl', 'numeric', 'min:2', 'max:20'],
            'ogtt_2h_mg_dl' => ['nullable', 'required_without_all:fasting_glucose_mg_dl,hba1c_percent,ogtt_1h_mg_dl', 'numeric', 'min:20', 'max:1000'],
            'ogtt_1h_mg_dl' => ['nullable', 'required_without_all:fasting_glucose_mg_dl,hba1c_percent,ogtt_2h_mg_dl', 'numeric', 'min:20', 'max:1000'],
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Critérios diagnósticos de pré-diabetes e diabetes (glicemia de jejum, HbA1c, TOTG de 1 h e de 2 h)',
            citation: 'Sociedade Brasileira de Diabetes, Diretriz Oficial da SBD — Diagnóstico de diabetes mellitus e rastreamento do DM tipo 2, revisão de 09/07/2024, DOI 10.29327/5412848.2024-1 (Tabela 1; recomendações R1 e R5).',
        );
    }

    public function lifeStages(): array
    {
        return [LifeStage::Adult, LifeStage::Elderly];
    }

    protected function formula(): FormulaInterface
    {
        return new DiagnosticoGlicemicoFormula;
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new DiagnosticoGlicemicoClassifier;
    }
}
