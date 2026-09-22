import { makeCalculator } from '../../support/makeCalculator';

export interface ConutInputs {
  albumin_g_dl: number;
  total_cholesterol_mg_dl: number;
  lymphocytes_cells_mm3: number;
}

/** Soma 3 subescores por faixa: albumina, colesterol total, linfócitos totais. Ignacio de Ulíbarri et al., 2005. */
export function conutFormula(inputs: ConutInputs): Record<string, number> {
  const albuminScore = inputs.albumin_g_dl >= 3.5 ? 0 : inputs.albumin_g_dl >= 3.0 ? 2 : inputs.albumin_g_dl >= 2.5 ? 4 : 6;
  const cholesterolScore =
    inputs.total_cholesterol_mg_dl >= 180 ? 0 : inputs.total_cholesterol_mg_dl >= 140 ? 1 : inputs.total_cholesterol_mg_dl >= 100 ? 2 : 3;
  const lymphocyteScore =
    inputs.lymphocytes_cells_mm3 >= 1600 ? 0 : inputs.lymphocytes_cells_mm3 >= 1200 ? 1 : inputs.lymphocytes_cells_mm3 >= 800 ? 2 : 3;

  return { total_score: albuminScore + cholesterolScore + lymphocyteScore };
}

export function conutClassifier(result: Record<string, number>): string {
  if (result.total_score <= 1) return 'normal';
  if (result.total_score <= 4) return 'desnutricao_leve';
  if (result.total_score <= 8) return 'desnutricao_moderada';
  return 'desnutricao_grave';
}

export const conutCalculator = makeCalculator<ConutInputs>({
  slug: 'conut',
  module: 'hospitalar',
  category: 'triagem_risco',
  version: 'v1',
  reference: {
    method: 'CONUT (Controlling Nutritional Status)',
    citation: 'Ignacio de Ulíbarri J et al., Nutr Hosp, 2005.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: conutFormula,
  classifier: conutClassifier,
});
