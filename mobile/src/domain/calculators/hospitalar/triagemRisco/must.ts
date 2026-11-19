import { exceeds, reaches } from '../../support/cutoff';
import { makeCalculator } from '../../support/makeCalculator';

export interface MustInputs {
  weight_kg: number;
  height_m: number;
  weight_loss_percent: number;
  acute_disease_effect: boolean;
}

/** Soma 3 subescores (0-2 cada): IMC, % perda de peso, doença aguda. BAPEN, 2003. */
export function mustFormula(inputs: MustInputs): Record<string, number> {
  const bmi = inputs.weight_kg / inputs.height_m ** 2;

  const bmiScore = exceeds(bmi, 20.0) ? 0 : reaches(bmi, 18.5) ? 1 : 2;
  const weightLossScore = inputs.weight_loss_percent < 5 ? 0 : inputs.weight_loss_percent <= 10 ? 1 : 2;
  const diseaseScore = inputs.acute_disease_effect ? 2 : 0;

  return { total_score: bmiScore + weightLossScore + diseaseScore };
}

export function mustClassifier(result: Record<string, number>): string {
  if (result.total_score <= 0) return 'risco_baixo';
  if (result.total_score === 1) return 'risco_medio';
  return 'risco_alto';
}

export const mustCalculator = makeCalculator<MustInputs>({
  slug: 'must',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v1',
  reference: {
    method: 'MUST (Malnutrition Universal Screening Tool)',
    citation: 'BAPEN / Malnutrition Advisory Group, The MUST Report, 2003.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: mustFormula,
  classifier: mustClassifier,
});
