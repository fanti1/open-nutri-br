import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface FormulaDeBolsoInputs {
  weight_kg: number;
  factor_kcal_per_kg: number;
}

/** GET = peso (kg) × fator (20–35 kcal/kg) escolhido pelo profissional; faixas de referência das diretrizes da ESPEN. */
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
    citation: 'Peso × fator escolhido pelo profissional. Faixas de referência: ESPEN UTI (Singer P et al., Clin Nutr, 2019): 20–25 kcal/kg/dia sem calorimetria; ESPEN polimórbidos (Gomes F et al., Clin Nutr, 2018): 27 kcal/kg (30 no baixo peso grave); ESPEN geriatria (Volkert D et al., Clin Nutr, 2019): cerca de 30 kcal/kg.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: formulaDeBolsoFormula,
});
