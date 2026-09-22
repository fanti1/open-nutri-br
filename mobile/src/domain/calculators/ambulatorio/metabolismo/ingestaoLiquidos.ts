import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface IngestaoLiquidosInputs {
  weight_kg: number;
}

const MIN_ML_PER_KG = 30;
const MAX_ML_PER_KG = 35;

/** 30–35 mL/kg/dia (adulto). Reference: ESPEN Guideline on Home Enteral Nutrition. */
export function ingestaoLiquidosFormula(inputs: IngestaoLiquidosInputs): Record<string, number> {
  return {
    min_ml_per_day: round2(inputs.weight_kg * MIN_ML_PER_KG),
    max_ml_per_day: round2(inputs.weight_kg * MAX_ML_PER_KG),
  };
}

export const ingestaoLiquidosCalculator = makeCalculator<IngestaoLiquidosInputs>({
  slug: 'ingestao-liquidos',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v1',
  reference: {
    method: 'Necessidade Hídrica Diária',
    citation: 'ESPEN Guideline on Home Enteral Nutrition, Clin Nutr.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: ingestaoLiquidosFormula,
});
