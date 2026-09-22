import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface MifflinStJeorInputs {
  weight_kg: number;
  height_cm: number;
  age_years: number;
  sex: 'male' | 'female';
}

/**
 * Homens: 10×peso+6.25×altura(cm)−5×idade+5; Mulheres: 10×peso+6.25×altura(cm)−5×idade−161.
 * Reference: Mifflin MD et al., Am J Clin Nutr, 1990.
 */
export function mifflinStJeorFormula(inputs: MifflinStJeorInputs): Record<string, number> {
  const base = 10 * inputs.weight_kg + 6.25 * inputs.height_cm - 5 * inputs.age_years;
  const bmr = inputs.sex === 'male' ? base + 5 : base - 161;

  return { bmr_kcal: round2(bmr) };
}

export const mifflinStJeorCalculator = makeCalculator<MifflinStJeorInputs>({
  slug: 'mifflin-st-jeor',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v1',
  reference: {
    method: 'Taxa Metabólica Basal (Mifflin-St Jeor)',
    citation: 'Mifflin MD et al., A new predictive equation for resting energy expenditure in healthy individuals, Am J Clin Nutr, 1990.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: mifflinStJeorFormula,
});
