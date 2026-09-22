import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface PesoIdealInputs {
  height_m: number;
  sex: 'male' | 'female';
}

const INCHES_PER_METER = 39.3701;

/**
 * Devine formula (1974). Homens: 50 + 2.3×(altura_pol−60); Mulheres: 45.5 + 2.3×(altura_pol−60).
 * Reference: Devine BJ, Gentamicin therapy, Drug Intell Clin Pharm, 1974;8:650-655.
 */
export function pesoIdealFormula(inputs: PesoIdealInputs): Record<string, number> {
  const heightIn = inputs.height_m * INCHES_PER_METER;
  const extraInches = Math.max(0, heightIn - 60);
  const baseKg = inputs.sex === 'male' ? 50.0 : 45.5;

  return { value: round2(baseKg + 2.3 * extraInches) };
}

export const pesoIdealCalculator = makeCalculator<PesoIdealInputs>({
  slug: 'peso-ideal',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v1',
  reference: {
    method: 'Peso Ideal (fórmula de Devine)',
    citation: 'Devine BJ, Gentamicin therapy, Drug Intell Clin Pharm, 1974;8:650-655.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: pesoIdealFormula,
});
