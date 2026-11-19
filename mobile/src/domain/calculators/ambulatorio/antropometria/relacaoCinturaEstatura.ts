import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface RelacaoCinturaEstaturaInputs {
  waist_cm: number;
  height_cm: number;
}

/** Cintura (cm) / estatura (cm). Ashwell et al., 2012. */
export function relacaoCinturaEstaturaFormula(inputs: RelacaoCinturaEstaturaInputs): Record<string, number> {
  return { waist_height_ratio: round2(inputs.waist_cm / inputs.height_cm) };
}

/**
 * NICE NG246 (2025, recomendação 1.9.11), adultos com IMC < 35: 0,4–0,49 saudável ·
 * 0,5–0,59 aumentada · ≥ 0,6 alta. Abaixo de 0,4 a NICE não classifica.
 */
export function relacaoCinturaEstaturaClassifier(result: Record<string, number>): string {
  if (result.waist_height_ratio >= 0.6) return 'adiposidade_central_alta';
  if (result.waist_height_ratio >= 0.5) return 'adiposidade_central_aumentada';
  if (result.waist_height_ratio >= 0.4) return 'adiposidade_central_saudavel';
  return 'abaixo_da_faixa_de_referencia';
}

export const relacaoCinturaEstaturaCalculator = makeCalculator<RelacaoCinturaEstaturaInputs>({
  slug: 'relacao-cintura-estatura',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v2',
  reference: {
    method: 'Relação cintura-estatura (adiposidade central)',
    citation: 'NICE, Overweight and obesity management (NG246), 2025; Ashwell M, Gunn P, Gibson S, Obes Rev, 2012.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: relacaoCinturaEstaturaFormula,
  classifier: relacaoCinturaEstaturaClassifier,
});
