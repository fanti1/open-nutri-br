<?php

namespace App\Domain\Calculators\Bioquimica\Glicemia\DiagnosticoGlicemico;

use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\IncompleteInputsException;

/**
 * Não há conta: o diagnóstico usa cada exame disponível (glicemia de jejum,
 * HbA1c, glicemia 2 h e 1 h após sobrecarga de 75 g). Devolve os exames
 * informados para o classificador e para o histórico da ficha.
 * Reference: Sociedade Brasileira de Diabetes, Diretriz Oficial (revisão 2024), Tabela 1.
 */
final class DiagnosticoGlicemicoFormula implements FormulaInterface
{
    public const EXAMS = ['fasting_glucose_mg_dl', 'hba1c_percent', 'ogtt_2h_mg_dl', 'ogtt_1h_mg_dl'];

    public function compute(array $inputs): array
    {
        $values = [];

        foreach (self::EXAMS as $exam) {
            if (isset($inputs[$exam]) && $inputs[$exam] !== '') {
                $values[$exam] = (float) $inputs[$exam];
            }
        }

        if ($values === []) {
            throw new IncompleteInputsException('Informe ao menos um exame: glicemia de jejum, HbA1c ou TOTG.');
        }

        return $values;
    }
}
