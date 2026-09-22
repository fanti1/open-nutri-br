import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface NutricaoParenteralInputs {
  non_protein_kcal: number;
  protein_g: number;
}

const PROTEIN_TO_NITROGEN_FACTOR = 6.25;

/** Relação kcal não-proteica : g N = kcal não-proteica / (proteína/6.25). ASPEN/BRASPEN Guidelines. */
export function nutricaoParenteralFormula(inputs: NutricaoParenteralInputs): Record<string, number> {
  const nitrogenG = inputs.protein_g / PROTEIN_TO_NITROGEN_FACTOR;

  return {
    nitrogen_g: round2(nitrogenG),
    kcal_per_gram_nitrogen: round2(inputs.non_protein_kcal / nitrogenG),
  };
}

export function nutricaoParenteralClassifier(result: Record<string, number>): string {
  if (result.kcal_per_gram_nitrogen < 100) return 'abaixo_da_faixa_recomendada';
  if (result.kcal_per_gram_nitrogen <= 150) return 'dentro_da_faixa_recomendada';
  return 'acima_da_faixa_recomendada';
}

export const nutricaoParenteralCalculator = makeCalculator<NutricaoParenteralInputs>({
  slug: 'nutricao-parenteral',
  module: 'hospitalar',
  category: 'suporte_nutricional',
  version: 'v1',
  reference: {
    method: 'Nutrição Parenteral (relação kcal não-proteica : N)',
    citation: 'ASPEN/BRASPEN Guidelines for Parenteral Nutrition.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: nutricaoParenteralFormula,
  classifier: nutricaoParenteralClassifier,
});
