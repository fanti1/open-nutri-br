import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface CurreriInputs {
  weight_kg: number;
  burned_body_surface_percent: number;
}

/** kcal = 25×peso + 40×%SCQ. Reference: Curreri PW et al., J Trauma, 1974. */
export function curreriFormula(inputs: CurreriInputs): Record<string, number> {
  return { get_kcal: round2(25 * inputs.weight_kg + 40 * inputs.burned_body_surface_percent) };
}

export const curreriCalculator = makeCalculator<CurreriInputs>({
  slug: 'curreri',
  module: 'hospitalar',
  category: 'suporte_nutricional',
  version: 'v1',
  reference: {
    method: 'Curreri (necessidade calórica em queimados)',
    citation: 'Curreri PW et al., J Trauma, 1974.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: curreriFormula,
});
