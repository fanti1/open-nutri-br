import { reaches } from '../../support/cutoff';
import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface CinturaQuadrilInputs {
  waist_cm: number;
  hip_cm: number;
  sex: 'male' | 'female';
}

/** RCQ = cintura / quadril. Reference: WHO, Waist Circumference and Waist-Hip Ratio, 2008. */
export function cinturaQuadrilFormula(inputs: CinturaQuadrilInputs): Record<string, number> {
  return { value: round2(inputs.waist_cm / inputs.hip_cm) };
}

/** Risco substancialmente aumentado: RCQ ≥ 0,90 (homens) ou ≥ 0,85 (mulheres). WHO, 2008, Tabela A1. */
export function cinturaQuadrilClassifier(
  result: Record<string, number>,
  inputs: CinturaQuadrilInputs,
): string {
  const cutoff = inputs.sex === 'male' ? 0.9 : 0.85;

  return reaches(result.value, cutoff) ? 'risco_aumentado' : 'risco_normal';
}

export const cinturaQuadrilCalculator = makeCalculator<CinturaQuadrilInputs>({
  slug: 'cintura-quadril',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v2',
  reference: {
    method: 'Relação Cintura-Quadril (RCQ)',
    citation:
      'World Health Organization, Waist Circumference and Waist-Hip Ratio: Report of a WHO Expert Consultation, 2008 (Tabela A1).',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: cinturaQuadrilFormula,
  classifier: cinturaQuadrilClassifier,
});
