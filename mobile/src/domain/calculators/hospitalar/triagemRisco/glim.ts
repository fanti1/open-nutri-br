import { makeCalculator } from '../../support/makeCalculator';

export type ReducedMuscleMass = 'nenhuma' | 'leve_moderada' | 'grave';

export interface GlimInputs {
  weight_loss_percent: number;
  weight_loss_period_months: number;
  bmi: number;
  age_years: number;
  reduced_muscle_mass: ReducedMuscleMass;
  reduced_food_intake: boolean;
  disease_burden_inflammation: boolean;
}

/**
 * Exige ≥1 critério fenotípico E ≥1 etiológico; gravidade = pior fenotípico.
 * Reference: Cederholm T et al., Clin Nutr / JPEN, 2019.
 */
export function glimFormula(inputs: GlimInputs): Record<string, number> {
  const bmiThresholdSevere = inputs.age_years >= 70 ? 20.0 : 18.5;
  const bmiThresholdModerate = inputs.age_years >= 70 ? 22.0 : 20.0;

  const weightLossSevere =
    inputs.weight_loss_period_months <= 6 ? inputs.weight_loss_percent > 10 : inputs.weight_loss_percent > 20;
  const weightLossModerate =
    inputs.weight_loss_period_months <= 6 ? inputs.weight_loss_percent >= 5 : inputs.weight_loss_percent >= 10;

  const isSevere = weightLossSevere || inputs.bmi < bmiThresholdSevere || inputs.reduced_muscle_mass === 'grave';
  const isModerate =
    !isSevere &&
    (weightLossModerate || inputs.bmi < bmiThresholdModerate || inputs.reduced_muscle_mass === 'leve_moderada');

  const phenotypicSeverity = isSevere ? 2 : isModerate ? 1 : 0;
  const etiologicMet = inputs.reduced_food_intake || inputs.disease_burden_inflammation;

  return {
    phenotypic_severity: phenotypicSeverity,
    etiologic_criteria_met: etiologicMet ? 1 : 0,
  };
}

export function glimClassifier(result: Record<string, number>): string {
  if (result.phenotypic_severity === 0 || result.etiologic_criteria_met === 0) return 'sem_desnutricao';
  return result.phenotypic_severity >= 2 ? 'desnutricao_grave' : 'desnutricao_moderada';
}

export const glimCalculator = makeCalculator<GlimInputs>({
  slug: 'glim',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v1',
  reference: {
    method: 'GLIM Criteria',
    citation: 'Cederholm T et al., GLIM criteria for the diagnosis of malnutrition, Clin Nutr / JPEN, 2019.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: glimFormula,
  classifier: glimClassifier,
});
