import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface IngestaoLiquidosInputs {
  weight_kg: number;
  /** Volume escolhido pelo profissional, em mL/kg/dia. */
  ml_per_kg: number;
}

/** Líquidos (mL/dia) = peso × mL/kg/dia. */
export function ingestaoLiquidosFormula(inputs: IngestaoLiquidosInputs): Record<string, number> {
  return { ml_per_day: round2(inputs.weight_kg * inputs.ml_per_kg) };
}

export const ingestaoLiquidosCalculator = makeCalculator<IngestaoLiquidosInputs>({
  slug: 'ingestao-liquidos',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v2',
  reference: {
    method: 'Necessidade Hídrica Diária (peso × mL/kg/dia)',
    citation:
      'Volume em mL/kg/dia escolhido pelo profissional. Recomendação de referência para idosos: Volkert D et al., ESPEN guideline on clinical nutrition and hydration in geriatrics, Clin Nutr, 2019.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: ingestaoLiquidosFormula,
});
