import { makeCalculator } from '../../support/makeCalculator';

export interface AnemiaOmsInputs {
  age_years: number;
  sex: 'male' | 'female';
  pregnant: boolean;
  hemoglobin_g_dl: number;
}

/**
 * Cortes de hemoglobina (g/dL) da OMS, 2011 — Tabela 1:
 * [sem anemia a partir de, leve a partir de, moderada a partir de]; abaixo é grave.
 */
export function anemiaCutoffs(inputs: AnemiaOmsInputs): [number, number, number] {
  if (inputs.sex === 'female' && inputs.pregnant) return [11.0, 10.0, 7.0];
  if (inputs.age_years < 5) return [11.0, 10.0, 7.0]; // 6–59 meses
  if (inputs.age_years < 12) return [11.5, 11.0, 8.0]; // 5–11 anos
  if (inputs.age_years < 15) return [12.0, 11.0, 8.0]; // 12–14 anos
  if (inputs.sex === 'female') return [12.0, 11.0, 8.0];
  return [13.0, 11.0, 8.0];
}

export function anemiaOmsFormula(inputs: AnemiaOmsInputs): Record<string, number> {
  return { hemoglobin_g_dl: inputs.hemoglobin_g_dl, anemia_cutoff_g_dl: anemiaCutoffs(inputs)[0] };
}

export function anemiaOmsClassifier(result: Record<string, number>, inputs: AnemiaOmsInputs): string {
  const [none, mild, moderate] = anemiaCutoffs(inputs);
  if (result.hemoglobin_g_dl >= none) return 'sem_anemia';
  if (result.hemoglobin_g_dl >= mild) return 'anemia_leve';
  if (result.hemoglobin_g_dl >= moderate) return 'anemia_moderada';
  return 'anemia_grave';
}

export const anemiaOmsCalculator = makeCalculator<AnemiaOmsInputs>({
  slug: 'anemia-oms',
  module: 'bioquimica',
  category: 'hematologia',
  version: 'v1',
  reference: {
    method: 'Diagnóstico e gravidade da anemia pela hemoglobina (OMS)',
    citation: 'World Health Organization, Haemoglobin concentrations for the diagnosis of anaemia and assessment of severity, WHO/NMH/NHD/MNM/11.1, 2011.',
  },
  lifeStages: ['crianca', 'adulto', 'idoso'],
  formula: anemiaOmsFormula,
  classifier: anemiaOmsClassifier,
});
