import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export type DelayedHypersensitivity = 'anergico' | 'menor_5mm' | 'maior_igual_5mm';

export interface PniInputs {
  albumin_g_dl: number;
  triceps_skinfold_mm: number;
  transferrin_mg_dl: number;
  delayed_hypersensitivity: DelayedHypersensitivity;
}

const DH_SCORES: Record<DelayedHypersensitivity, number> = {
  anergico: 0,
  menor_5mm: 1,
  maior_igual_5mm: 2,
};

/**
 * PNI(%) = 158 − 16.6×albumina − 0.78×prega tricipital − 0.2×transferrina − 5.8×DH.
 * Sem classificação: as faixas de risco não foram conferidas no artigo original.
 * Reference: Buzby GP et al., Am J Surg, 1980.
 */
export function pniFormula(inputs: PniInputs): Record<string, number> {
  const dhScore = DH_SCORES[inputs.delayed_hypersensitivity];

  const pni =
    158 -
    16.6 * inputs.albumin_g_dl -
    0.78 * inputs.triceps_skinfold_mm -
    0.2 * inputs.transferrin_mg_dl -
    5.8 * dhScore;

  return { pni_percent: round2(pni) };
}

export const pniCalculator = makeCalculator<PniInputs>({
  slug: 'pni',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v2',
  reference: {
    method: 'PNI (Índice de Prognóstico Nutricional)',
    citation: 'Buzby GP et al., Prognostic nutritional index in gastrointestinal surgery, Am J Surg, 1980;139(1):160-7.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: pniFormula,
});
