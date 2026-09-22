import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';
import { imcFormula } from './imc';

export interface GorduraCorporalInputs {
  weight_kg: number;
  height_m: number;
  age_years: number;
  sex: 'male' | 'female';
}

/**
 * Deurenberg formula (1991), reusing imcFormula so the two never drift apart.
 * %GC = (1.20×IMC) + (0.23×idade) − (10.8×sexo) − 5.4 (sexo: 1=homem, 0=mulher).
 * Reference: Deurenberg P, Weststrate JA, Seidell JC, Br J Nutr, 1991.
 */
export function gorduraCorporalFormula(inputs: GorduraCorporalInputs): Record<string, number> {
  const imc = imcFormula(inputs).value;
  const sexFactor = inputs.sex === 'male' ? 1 : 0;
  const percentage = 1.2 * imc + 0.23 * inputs.age_years - 10.8 * sexFactor - 5.4;

  return { percentage: round2(percentage) };
}

export const gorduraCorporalCalculator = makeCalculator<GorduraCorporalInputs>({
  slug: 'gordura-corporal',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v1',
  reference: {
    method: '% Gordura Corporal (fórmula de Deurenberg)',
    citation: 'Deurenberg P, Weststrate JA, Seidell JC, Body mass index as a measure of body fatness, Br J Nutr, 1991.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: gorduraCorporalFormula,
});
