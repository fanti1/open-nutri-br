import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export type ClinicalContext = 'saudavel' | 'hospitalizado_leve' | 'hospitalizado_moderado' | 'critico';

export interface NecessidadesProteicasInputs {
  weight_kg: number;
  clinical_context: ClinicalContext;
}

/**
 * g proteína/kg/dia por contexto clínico. Reference: ESPEN Guideline on
 * Clinical Nutrition, 2016; Institute of Medicine, DRI, 2005.
 */
export const PROTEIN_FACTORS_G_PER_KG: Record<ClinicalContext, number> = {
  saudavel: 0.8,
  hospitalizado_leve: 1.2,
  hospitalizado_moderado: 1.5,
  critico: 2.0,
};

export function necessidadesProteicasFormula(inputs: NecessidadesProteicasInputs): Record<string, number> {
  return {
    protein_g_per_day: round2(inputs.weight_kg * PROTEIN_FACTORS_G_PER_KG[inputs.clinical_context]),
  };
}

export const necessidadesProteicasCalculator = makeCalculator<NecessidadesProteicasInputs>({
  slug: 'necessidades-proteicas',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v1',
  reference: {
    method: 'Necessidades Proteicas Diárias',
    citation: 'ESPEN Guideline on Clinical Nutrition, Clin Nutr, 2016; Institute of Medicine, Dietary Reference Intakes, 2005.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: necessidadesProteicasFormula,
});
