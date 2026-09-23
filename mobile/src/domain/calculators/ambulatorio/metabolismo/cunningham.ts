import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface CunninghamInputs {
  weight_kg: number;
  body_fat_percent: number;
}

/** TMB = 500 + 22 × massa magra (kg); massa magra = peso × (1 − %G/100). Cunningham, 1980. */
export function cunninghamFormula(inputs: CunninghamInputs): Record<string, number> {
  const leanMass = inputs.weight_kg * (1 - inputs.body_fat_percent / 100);

  return { bmr_kcal: round2(500 + 22 * leanMass), lean_mass_kg: round2(leanMass) };
}

export const cunninghamCalculator = makeCalculator<CunninghamInputs>({
  slug: 'cunningham',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v1',
  reference: {
    method: 'Taxa metabólica basal pela massa magra (Cunningham)',
    citation: 'Cunningham JJ, A reanalysis of the factors influencing basal metabolic rate in normal adults, Am J Clin Nutr, 1980.',
  },
  lifeStages: ['adulto'],
  formula: cunninghamFormula,
});
