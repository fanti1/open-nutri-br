import { makeCalculator } from '../../support/makeCalculator';

export type AsgRating = 'A' | 'B' | 'C';

export interface AsgDetskyInputs {
  weight_change_rating: AsgRating;
  dietary_intake_rating: AsgRating;
  gi_symptoms_rating: AsgRating;
  functional_capacity_rating: AsgRating;
  metabolic_demand_rating: AsgRating;
  physical_exam_rating: AsgRating;
  /** Classificação global: julgamento do avaliador, não uma conta. */
  global_rating: AsgRating;
}

/**
 * Quantos domínios o avaliador marcou em A, B e C — apoio à decisão. Na ASG a
 * classificação é o julgamento global do avaliador (Detsky AS et al., JPEN,
 * 1987), não a soma nem a categoria mais frequente.
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

const GLOBAL_CLASSIFICATION: Record<AsgRating, string> = {
  A: 'bem_nutrido',
  B: 'moderadamente_desnutrido_ou_suspeita',
  C: 'gravemente_desnutrido',
};

/** A classificação é a que o avaliador atribuiu (A, B ou C). */
export function asgDetskyClassifier(_result: Record<string, number>, inputs: AsgDetskyInputs): string {
  return GLOBAL_CLASSIFICATION[inputs.global_rating];
}

export const asgDetskyCalculator = makeCalculator<AsgDetskyInputs>({
  slug: 'asg-detsky',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v2',
  reference: {
    method: 'ASG / SGA (Avaliação Subjetiva Global — Detsky)',
    citation: 'Detsky AS et al., What is subjective global assessment of nutritional status?, JPEN, 1987.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: asgDetskyFormula,
  classifier: asgDetskyClassifier,
});
