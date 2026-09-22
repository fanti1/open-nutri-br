import { makeCalculator } from '../../support/makeCalculator';

export interface FerritinaOmsInputs {
  age_years: number;
  inflammation: boolean;
  ferritin_ng_ml: number;
}

/**
 * Corte de ferritina (µg/L) da OMS, 2020: < 5 anos 12 (saudável) ou 30 (com
 * infecção/inflamação); ≥ 5 anos 15 ou 70.
 */
export function ferritinaOmsFormula(inputs: FerritinaOmsInputs): Record<string, number> {
  const underFive = inputs.age_years < 5;
  const cutoff = underFive ? (inputs.inflammation ? 30 : 12) : inputs.inflammation ? 70 : 15;

  return { ferritin_ng_ml: inputs.ferritin_ng_ml, ferritin_cutoff_ng_ml: cutoff };
}

export function ferritinaOmsClassifier(result: Record<string, number>): string {
  return result.ferritin_ng_ml < result.ferritin_cutoff_ng_ml ? 'deficiencia_de_ferro' : 'sem_deficiencia_de_ferro';
}

export const ferritinaOmsCalculator = makeCalculator<FerritinaOmsInputs>({
  slug: 'ferritina-oms',
  module: 'bioquimica',
  category: 'hematologia',
  version: 'v1',
  reference: {
    method: 'Deficiência de ferro pela ferritina sérica (OMS)',
    citation: 'World Health Organization, WHO guideline on use of ferritin concentrations to assess iron status in individuals and populations, 2020.',
  },
  lifeStages: ['crianca', 'adulto', 'idoso'],
  formula: ferritinaOmsFormula,
  classifier: ferritinaOmsClassifier,
});
