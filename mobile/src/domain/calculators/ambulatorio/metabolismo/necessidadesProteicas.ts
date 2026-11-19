import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface NecessidadesProteicasInputs {
  weight_kg: number;
  /** Meta escolhida pelo profissional (ESPEN: 1,3 na UTI; ≥ 1,0 em polimórbidos e idosos). */
  protein_g_per_kg: number;
}

/** Proteína (g/dia) = peso × g/kg/dia. */
export function necessidadesProteicasFormula(inputs: NecessidadesProteicasInputs): Record<string, number> {
  return { protein_g_per_day: round2(inputs.weight_kg * inputs.protein_g_per_kg) };
}

export const necessidadesProteicasCalculator = makeCalculator<NecessidadesProteicasInputs>({
  slug: 'necessidades-proteicas',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v2',
  reference: {
    method: 'Necessidades Proteicas Diárias (peso × g/kg/dia)',
    citation:
      'Meta em g/kg/dia escolhida pelo profissional. Recomendações de referência: Singer P et al., ESPEN guideline on clinical nutrition in the ICU, Clin Nutr, 2023; Gomes F et al., ESPEN guidelines for polymorbid internal medicine patients, Clin Nutr, 2018; Volkert D et al., ESPEN guideline on clinical nutrition and hydration in geriatrics, Clin Nutr, 2019.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: necessidadesProteicasFormula,
});
