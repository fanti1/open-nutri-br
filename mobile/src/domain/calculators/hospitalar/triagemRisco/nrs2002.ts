import { makeCalculator } from '../../support/makeCalculator';

export interface Nrs2002Inputs {
  nutritional_status_score: number;
  severity_score: number;
  age_years: number;
}

/**
 * NRS-2002 = escore de estado nutricional (0-3) + escore de gravidade da
 * doença (0-3) + ajuste de idade (+1 se ≥70 anos).
 * Reference: Kondrup J et al., Clin Nutr, 2003.
 */
export function nrs2002Formula(inputs: Nrs2002Inputs): Record<string, number> {
  const ageAdjustment = inputs.age_years >= 70 ? 1 : 0;

  return { total_score: inputs.nutritional_status_score + inputs.severity_score + ageAdjustment };
}

export function nrs2002Classifier(result: Record<string, number>): string {
  return result.total_score >= 3 ? 'risco_nutricional' : 'sem_risco_atual';
}

export const nrs2002Calculator = makeCalculator<Nrs2002Inputs>({
  slug: 'nrs-2002',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v1',
  reference: {
    method: 'NRS-2002 (Nutritional Risk Screening)',
    citation: 'Kondrup J et al., Nutritional risk screening (NRS 2002), Clin Nutr, 2003.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: nrs2002Formula,
  classifier: nrs2002Classifier,
});
