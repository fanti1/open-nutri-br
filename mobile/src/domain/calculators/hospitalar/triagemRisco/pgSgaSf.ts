import { makeCalculator } from '../../support/makeCalculator';

export interface PgSgaSfInputs {
  box1_weight_history_score: number;
  box2_food_intake_score: number;
  box3_symptoms_score: number;
  box4_activity_function_score: number;
}

/** Soma dos 4 boxes já pontuados. Reference: Ottery FD, Nutrition, 1996; Bauer et al., 2002. */
export function pgSgaSfFormula(inputs: PgSgaSfInputs): Record<string, number> {
  return {
    total_score:
      inputs.box1_weight_history_score +
      inputs.box2_food_intake_score +
      inputs.box3_symptoms_score +
      inputs.box4_activity_function_score,
  };
}

export function pgSgaSfClassifier(result: Record<string, number>): string {
  if (result.total_score <= 1) return 'sem_necessidade_intervencao';
  if (result.total_score <= 3) return 'educacao_nutricional';
  if (result.total_score <= 8) return 'intervencao_por_nutricionista';
  return 'intervencao_critica_urgente';
}

export const pgSgaSfCalculator = makeCalculator<PgSgaSfInputs>({
  slug: 'pg-sga-sf',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v1',
  reference: {
    method: 'PG-SGA SF (Patient-Generated SGA — Short Form)',
    citation: 'Ottery FD, Nutrition, 1996; Bauer J, Capra S, Ferguson M, Eur J Clin Nutr, 2002.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: pgSgaSfFormula,
  classifier: pgSgaSfClassifier,
});
