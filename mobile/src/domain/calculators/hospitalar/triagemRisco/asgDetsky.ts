import { makeCalculator } from '../../support/makeCalculator';

export type AsgRating = 'A' | 'B' | 'C';

export interface AsgDetskyInputs {
  weight_change_rating: AsgRating;
  dietary_intake_rating: AsgRating;
  gi_symptoms_rating: AsgRating;
  functional_capacity_rating: AsgRating;
  metabolic_demand_rating: AsgRating;
  physical_exam_rating: AsgRating;
}

/**
 * A ASG original é julgamento clínico global, sem soma determinística
 * publicada. Esta é uma simplificação de apoio: categoria mais frequente
 * entre os 6 domínios (desempate a favor da mais grave).
 * Reference: Detsky AS et al., JPEN, 1987.
 */
export function asgDetskyFormula(inputs: AsgDetskyInputs): Record<string, number> {
  const ratings = [
    inputs.weight_change_rating,
    inputs.dietary_intake_rating,
    inputs.gi_symptoms_rating,
    inputs.functional_capacity_rating,
    inputs.metabolic_demand_rating,
    inputs.physical_exam_rating,
  ];

  return {
    count_a: ratings.filter((r) => r === 'A').length,
    count_b: ratings.filter((r) => r === 'B').length,
    count_c: ratings.filter((r) => r === 'C').length,
  };
}

export function asgDetskyClassifier(result: Record<string, number>): string {
  const max = Math.max(result.count_a, result.count_b, result.count_c);

  if (result.count_c === max) return 'gravemente_desnutrido';
  if (result.count_b === max) return 'moderadamente_desnutrido_ou_suspeita';
  return 'bem_nutrido';
}

export const asgDetskyCalculator = makeCalculator<AsgDetskyInputs>({
  slug: 'asg-detsky',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v1',
  reference: {
    method: 'ASG / SGA (Avaliação Subjetiva Global — Detsky)',
    citation: 'Detsky AS et al., What is subjective global assessment of nutritional status?, JPEN, 1987.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: asgDetskyFormula,
  classifier: asgDetskyClassifier,
});
