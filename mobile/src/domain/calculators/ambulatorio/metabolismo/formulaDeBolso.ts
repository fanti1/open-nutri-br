import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface FormulaDeBolsoInputs {
  weight_kg: number;
  factor_kcal_per_kg: number;
}

/** GET = peso(kg) × fator (20–35 kcal/kg). Reference: ASPEN Guidelines, McClave et al., JPEN, 2016. */
export function formulaDeBolsoFormula(inputs: FormulaDeBolsoInputs): Record<string, number> {
  return { get_kcal: round2(inputs.weight_kg * inputs.factor_kcal_per_kg) };
}

export const formulaDeBolsoCalculator = makeCalculator<FormulaDeBolsoInputs>({
  slug: 'formula-de-bolso',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v1',
  reference: {
    method: 'Fórmula de Bolso (estimativa rápida de GET)',
    citation: 'McClave SA et al., ASPEN Clinical Guidelines: Nutrition Support Therapy, JPEN, 2016.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: formulaDeBolsoFormula,
});
