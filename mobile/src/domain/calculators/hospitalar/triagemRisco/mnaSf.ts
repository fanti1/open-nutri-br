import { makeCalculator } from '../../support/makeCalculator';

export interface MnaSfInputs {
  food_intake_score: number;
  weight_loss_score: number;
  mobility_score: number;
  psychological_stress_score: number;
  neuropsychological_score: number;
  bmi_score: number;
}

/** Soma de 6 itens (0–14); categorias 12–14 / 8–11 / 0–7 do MNA-SF revisado (Kaiser et al., 2009). */
export function mnaSfFormula(inputs: MnaSfInputs): Record<string, number> {
  const total =
    inputs.food_intake_score +
    inputs.weight_loss_score +
    inputs.mobility_score +
    inputs.psychological_stress_score +
    inputs.neuropsychological_score +
    inputs.bmi_score;

  return { total_score: total };
}

export function mnaSfClassifier(result: Record<string, number>): string {
  if (result.total_score >= 12) return 'estado_nutricional_normal';
  if (result.total_score >= 8) return 'risco_de_desnutricao';
  return 'desnutrido';
}

export const mnaSfCalculator = makeCalculator<MnaSfInputs>({
  slug: 'mna-sf',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v1',
  reference: {
    method: 'MNA-SF (Mini Nutritional Assessment — Short Form)',
    citation: 'Kaiser MJ et al., J Nutr Health Aging, 2009; Rubenstein LZ et al., J Gerontol A Biol Sci Med Sci, 2001; formulário oficial MNA-SF (Nestlé, revisão 2009).',
  },
  lifeStages: ['idoso'],
  formula: mnaSfFormula,
  classifier: mnaSfClassifier,
});
