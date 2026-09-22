import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';

export interface ValorCaloricoTotalInputs {
  bmr_kcal: number;
  activity_level: ActivityLevel;
}

/** Fatores de atividade conforme FAO/WHO/UNU, Human Energy Requirements, 2001. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9,
};

export function valorCaloricoTotalFormula(inputs: ValorCaloricoTotalInputs): Record<string, number> {
  return { vct_kcal: round2(inputs.bmr_kcal * ACTIVITY_FACTORS[inputs.activity_level]) };
}

export const valorCaloricoTotalCalculator = makeCalculator<ValorCaloricoTotalInputs>({
  slug: 'valor-calorico-total',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v1',
  reference: {
    method: 'Valor Calórico Total (VCT)',
    citation: 'FAO/WHO/UNU, Human Energy Requirements: Report of a Joint Expert Consultation, 2001.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: valorCaloricoTotalFormula,
});
