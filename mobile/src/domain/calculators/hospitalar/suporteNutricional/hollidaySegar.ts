import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface HollidaySegarInputs {
  weight_kg: number;
}

/** 100/50/20 mL/kg por faixa de peso. Reference: Holliday MA, Segar WE, Pediatrics, 1957. */
export function hollidaySegarFormula(inputs: HollidaySegarInputs): Record<string, number> {
  const { weight_kg } = inputs;

  const ml =
    weight_kg <= 10 ? weight_kg * 100 : weight_kg <= 20 ? 1000 + (weight_kg - 10) * 50 : 1500 + (weight_kg - 20) * 20;

  return { ml_per_day: round2(ml) };
}

export const hollidaySegarCalculator = makeCalculator<HollidaySegarInputs>({
  slug: 'holliday-segar',
  module: 'hospitalar',
  category: 'suporte_nutricional',
  version: 'v1',
  reference: {
    method: 'Necessidade Hídrica (Holliday-Segar)',
    citation: 'Holliday MA, Segar WE, Pediatrics, 1957.',
  },
  lifeStages: ['crianca', 'adulto', 'idoso'],
  formula: hollidaySegarFormula,
});
