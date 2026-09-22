import { makeCalculator } from '../../support/makeCalculator';

export interface MNutricInputs {
  age_years: number;
  apache_ii: number;
  sofa: number;
  comorbidities_count: number;
  days_hospital_to_icu: number;
}

/**
 * mNUTRIC (sem IL-6): soma pontos por idade, APACHE II, SOFA, comorbidades e
 * dias até admissão na UTI.
 * Reference: Heyland DK et al., Crit Care, 2011; Rahman A et al., Clin Nutr, 2016.
 */
export function mNutricFormula(inputs: MNutricInputs): Record<string, number> {
  const agePoints = inputs.age_years < 50 ? 0 : inputs.age_years < 75 ? 1 : 2;
  const apachePoints = inputs.apache_ii < 15 ? 0 : inputs.apache_ii < 20 ? 1 : inputs.apache_ii < 28 ? 2 : 3;
  const sofaPoints = inputs.sofa < 6 ? 0 : inputs.sofa < 10 ? 1 : 2;
  const comorbidityPoints = inputs.comorbidities_count >= 2 ? 1 : 0;
  const daysPoints = inputs.days_hospital_to_icu >= 1 ? 1 : 0;

  return { total_score: agePoints + apachePoints + sofaPoints + comorbidityPoints + daysPoints };
}

export function mNutricClassifier(result: Record<string, number>): string {
  return result.total_score >= 5 ? 'alto_risco_nutricional' : 'baixo_risco_nutricional';
}

export const mNutricCalculator = makeCalculator<MNutricInputs>({
  slug: 'mnutric',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v1',
  reference: {
    method: 'mNUTRIC Score (NUTRIC modificado)',
    citation: 'Heyland DK et al., Crit Care, 2011; Rahman A et al., Clin Nutr, 2016.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: mNutricFormula,
  classifier: mNutricClassifier,
});
