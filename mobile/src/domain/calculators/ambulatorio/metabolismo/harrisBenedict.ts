import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface HarrisBenedictInputs {
  weight_kg: number;
  height_cm: number;
  age_years: number;
  sex: 'male' | 'female';
}

/**
 * Harris-Benedict revisado (Roza & Shizgal, 1984).
 * Homens: 88.362+13.397×peso+4.799×altura(cm)−5.677×idade
 * Mulheres: 447.593+9.247×peso+3.098×altura(cm)−4.330×idade
 */
export function harrisBenedictFormula(inputs: HarrisBenedictInputs): Record<string, number> {
  const { weight_kg, height_cm, age_years } = inputs;

  const bmr =
    inputs.sex === 'male'
      ? 88.362 + 13.397 * weight_kg + 4.799 * height_cm - 5.677 * age_years
      : 447.593 + 9.247 * weight_kg + 3.098 * height_cm - 4.33 * age_years;

  return { bmr_kcal: round2(bmr) };
}

export const harrisBenedictCalculator = makeCalculator<HarrisBenedictInputs>({
  slug: 'harris-benedict',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v1',
  reference: {
    method: 'Taxa Metabólica Basal (Harris-Benedict revisado)',
    citation: 'Roza AM, Shizgal HM, The Harris Benedict equation reevaluated, Am J Clin Nutr, 1984.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: harrisBenedictFormula,
});
