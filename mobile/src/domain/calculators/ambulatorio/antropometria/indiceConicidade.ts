import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface IndiceConicidadeInputs {
  waist_cm: number;
  weight_kg: number;
  height_cm: number;
  sex: 'male' | 'female';
}

/** IC = cintura (m) / (0,109 × √(peso (kg) / estatura (m))). Valdez, 1991. */
export function indiceConicidadeFormula(inputs: IndiceConicidadeInputs): Record<string, number> {
  const waistM = inputs.waist_cm / 100;
  const heightM = inputs.height_cm / 100;

  return { conicity_index: round2(waistM / (0.109 * Math.sqrt(inputs.weight_kg / heightM))) };
}

/** Risco coronariano elevado em adultos brasileiros: ≥ 1,25 (homens) / ≥ 1,18 (mulheres). Pitanga & Lessa, 2004. */
export function indiceConicidadeClassifier(result: Record<string, number>, inputs: IndiceConicidadeInputs): string {
  const cutoff = inputs.sex === 'male' ? 1.25 : 1.18;
  return result.conicity_index >= cutoff ? 'risco_coronariano_elevado' : 'sem_risco_coronariano_elevado';
}

export const indiceConicidadeCalculator = makeCalculator<IndiceConicidadeInputs>({
  slug: 'indice-conicidade',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v1',
  reference: {
    method: 'Índice de conicidade (adiposidade abdominal)',
    citation: 'Valdez R, J Clin Epidemiol, 1991; pontos de corte: Pitanga FJG, Lessa I, Rev Bras Epidemiol, 2004.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: indiceConicidadeFormula,
  classifier: indiceConicidadeClassifier,
});
