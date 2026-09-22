import { makeCalculator } from '../../support/makeCalculator';
import { IncompleteInputsError } from '../../types';

export interface DiagnosticoGlicemicoInputs {
  fasting_glucose_mg_dl?: number;
  hba1c_percent?: number;
  ogtt_2h_mg_dl?: number;
}

type Exam = keyof DiagnosticoGlicemicoInputs;

/** [pré-diabetes a partir de, diabetes a partir de] — SBD 2023, iguais aos da ADA. */
const THRESHOLDS: Record<Exam, [number, number]> = {
  fasting_glucose_mg_dl: [100, 126],
  hba1c_percent: [5.7, 6.5],
  ogtt_2h_mg_dl: [140, 200],
};

const EXAMS = Object.keys(THRESHOLDS) as Exam[];

/** Sem conta: devolve os exames informados, na ordem da diretriz. */
export function diagnosticoGlicemicoFormula(inputs: DiagnosticoGlicemicoInputs): Record<string, number> {
  const values: Record<string, number> = {};
  for (const exam of EXAMS) {
    const value = inputs[exam];
    if (value !== undefined && value !== null) values[exam] = value;
  }

  if (Object.keys(values).length === 0) {
    throw new IncompleteInputsError('Informe ao menos um exame: glicemia de jejum, HbA1c ou TOTG.');
  }
  return values;
}

/** Vale o exame mais alterado; um exame isolado na faixa de diabetes precisa ser confirmado. */
export function diagnosticoGlicemicoClassifier(result: Record<string, number>): string {
  let level = 0;
  for (const [exam, value] of Object.entries(result)) {
    const [prediabetes, diabetes] = THRESHOLDS[exam as Exam];
    level = Math.max(level, value >= diabetes ? 2 : value >= prediabetes ? 1 : 0);
  }
  return ['normoglicemia', 'pre_diabetes', 'compativel_com_diabetes'][level];
}

export const diagnosticoGlicemicoCalculator = makeCalculator<DiagnosticoGlicemicoInputs>({
  slug: 'glicemia-diagnostico',
  module: 'bioquimica',
  category: 'glicemia',
  version: 'v1',
  reference: {
    method: 'Critérios diagnósticos de pré-diabetes e diabetes (glicemia de jejum, HbA1c, TOTG)',
    citation: 'Sociedade Brasileira de Diabetes, Diretriz Oficial da SBD — Diagnóstico de diabetes mellitus, 2023.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: diagnosticoGlicemicoFormula,
  classifier: diagnosticoGlicemicoClassifier,
});
