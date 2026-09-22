<?php

namespace App\Domain\Calculators\Bioquimica\Glicemia\DiagnosticoGlicemico;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Faixas da SBD (2023), iguais às da ADA; vale o exame mais alterado.
 *   Glicemia de jejum: < 100 normal · 100–125 pré-diabetes · ≥ 126 diabetes
 *   HbA1c: < 5,7% normal · 5,7–6,4% pré-diabetes · ≥ 6,5% diabetes
 *   TOTG 2 h: < 140 normal · 140–199 pré-diabetes · ≥ 200 diabetes
 * Um único exame na faixa de diabetes, sem sintomas, precisa ser confirmado —
 * por isso "compatível com diabetes", não "diabetes".
 */
final class DiagnosticoGlicemicoClassifier implements ClassifierInterface
{
    /** @var array<string, array{0: float, 1: float}> [pré-diabetes a partir de, diabetes a partir de] */
    private const THRESHOLDS = [
        'fasting_glucose_mg_dl' => [100.0, 126.0],
        'hba1c_percent' => [5.7, 6.5],
        'ogtt_2h_mg_dl' => [140.0, 200.0],
    ];

    public function classify(array $result, array $inputs): string
    {
        $level = 0;

        foreach ($result as $exam => $value) {
            [$prediabetes, $diabetes] = self::THRESHOLDS[$exam];
            $level = max($level, match (true) {
                $value >= $diabetes => 2,
                $value >= $prediabetes => 1,
                default => 0,
            });
        }

        return ['normoglicemia', 'pre_diabetes', 'compativel_com_diabetes'][$level];
    }
}
