import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface NutricaoParenteralInputs {
  non_protein_kcal: number;
  protein_g: number;
}

const PROTEIN_TO_NITROGEN_FACTOR = 6.25;

/**
 * Relação kcal não proteicas : g N = kcal não proteicas / (proteína/6,25) — a proteína tem cerca
 * de 16% de nitrogênio. Sem classificação: a faixa "recomendada" de 100–150 kcal/g N não foi
 * encontrada numa fonte conferível.
 */
export function nutricaoParenteralFormula(inputs: NutricaoParenteralInputs): Record<string, number> {
  const nitrogenG = inputs.protein_g / PROTEIN_TO_NITROGEN_FACTOR;

  return {
    nitrogen_g: round2(nitrogenG),
    kcal_per_gram_nitrogen: round2(inputs.non_protein_kcal / nitrogenG),
  };
}

export const nutricaoParenteralCalculator = makeCalculator<NutricaoParenteralInputs>({
  slug: 'nutricao-parenteral',
  module: 'hospitalar',
  category: 'suporte_nutricional',
  version: 'v2',
  reference: {
    method: 'Nutrição Parenteral (relação kcal não proteicas : g de N)',
    citation: 'Conta aritmética: N (g) = proteína ÷ 6,25 (a proteína tem cerca de 16% de nitrogênio); relação = kcal não proteicas ÷ N.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: nutricaoParenteralFormula,
});
