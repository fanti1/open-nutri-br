import { exceeds, reaches } from '../../support/cutoff';
import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';
import { IncompleteInputsError } from '../../types';

export interface PerfilLipidicoInputs {
  total_cholesterol_mg_dl: number;
  hdl_mg_dl: number;
  triglycerides_mg_dl: number;
  fasting: boolean;
}

/** Acima deste TG (mg/dL) a SBC (2025) manda avaliar o não-HDL-c: o LDL-c por Martin/Hopkins pode sair subestimado. */
export const MARTIN_MAX_TG = 800;

/** Limite inferior (mg/dL) de cada faixa de triglicerídeos da tabela de 180 células (7–49, 50–56, …, 400–13.975). */
const MARTIN_TG_BOUNDS = [7, 50, 57, 62, 67, 72, 76, 80, 84, 88, 93, 97, 101, 106, 111, 116, 121, 127, 133, 139, 147, 155, 164, 174, 186, 202, 221, 248, 293, 400];

/** Limite inferior (mg/dL) de cada faixa de não-HDL-c: < 100, 100–129, 130–159, 160–189, 190–219, ≥ 220. */
const MARTIN_NON_HDL_BOUNDS = [-Infinity, 100, 130, 160, 190, 220];

/**
 * Fator (razão TG:VLDL-c) por faixa de TG (linhas) e de não-HDL-c (colunas).
 * Martin SS et al., JAMA, 2013; conferido na Tabela 1 da Atualização da
 * Diretriz Brasileira de Dislipidemias (SBC, 2017) e no pacote LDLcalc (CRAN).
 */
const MARTIN_FACTORS: number[][] = [
  [3.5, 3.4, 3.3, 3.3, 3.2, 3.1],
  [4.0, 3.9, 3.7, 3.6, 3.6, 3.4],
  [4.3, 4.1, 4.0, 3.9, 3.8, 3.6],
  [4.5, 4.3, 4.1, 4.0, 3.9, 3.9],
  [4.7, 4.4, 4.3, 4.2, 4.1, 3.9],
  [4.8, 4.6, 4.4, 4.2, 4.2, 4.1],
  [4.9, 4.6, 4.5, 4.3, 4.3, 4.2],
  [5.0, 4.8, 4.6, 4.4, 4.3, 4.2],
  [5.1, 4.8, 4.6, 4.5, 4.4, 4.3],
  [5.2, 4.9, 4.7, 4.6, 4.4, 4.3],
  [5.3, 5.0, 4.8, 4.7, 4.5, 4.4],
  [5.4, 5.1, 4.8, 4.7, 4.5, 4.3],
  [5.5, 5.2, 5.0, 4.7, 4.6, 4.5],
  [5.6, 5.3, 5.0, 4.8, 4.6, 4.5],
  [5.7, 5.4, 5.1, 4.9, 4.7, 4.5],
  [5.8, 5.5, 5.2, 5.0, 4.8, 4.6],
  [6.0, 5.5, 5.3, 5.0, 4.8, 4.6],
  [6.1, 5.7, 5.3, 5.1, 4.9, 4.7],
  [6.2, 5.8, 5.4, 5.2, 5.0, 4.7],
  [6.3, 5.9, 5.6, 5.3, 5.0, 4.8],
  [6.5, 6.0, 5.7, 5.4, 5.1, 4.8],
  [6.7, 6.2, 5.8, 5.4, 5.2, 4.9],
  [6.8, 6.3, 5.9, 5.5, 5.3, 5.0],
  [7.0, 6.5, 6.0, 5.7, 5.4, 5.1],
  [7.3, 6.7, 6.2, 5.8, 5.5, 5.2],
  [7.6, 6.9, 6.4, 6.0, 5.6, 5.3],
  [8.0, 7.2, 6.6, 6.2, 5.9, 5.4],
  [8.5, 7.6, 7.0, 6.5, 6.1, 5.6],
  [9.5, 8.3, 7.5, 7.0, 6.5, 5.9],
  [11.9, 10.0, 8.8, 8.1, 7.5, 6.7],
];

/** Índice da última faixa cujo limite inferior o valor alcança. */
function bandIndex(bounds: number[], value: number): number {
  let index = 0;
  bounds.forEach((bound, i) => {
    if (reaches(value, bound)) index = i;
  });
  return index;
}

export function martinHopkinsFactor(triglycerides: number, nonHdl: number): number {
  return MARTIN_FACTORS[bandIndex(MARTIN_TG_BOUNDS, triglycerides)][bandIndex(MARTIN_NON_HDL_BOUNDS, nonHdl)];
}

/**
 * LDL-c (Martin/Hopkins, 2013) = CT − HDL-c − TG/fator, com o fator da tabela de
 * 180 células; com TG > 800 mg/dL fica de fora do resultado. Não-HDL-c = CT − HDL-c.
 */
export function perfilLipidicoFormula(inputs: PerfilLipidicoInputs): Record<string, number> {
  const { total_cholesterol_mg_dl: total, hdl_mg_dl: hdl, triglycerides_mg_dl: triglycerides } = inputs;

  // O HDL-c é uma fração do colesterol total.
  if (hdl >= total) throw new IncompleteInputsError('O HDL-c precisa ser menor que o colesterol total.');

  const nonHdl = total - hdl;
  const values: Record<string, number> = {};

  if (!exceeds(triglycerides, MARTIN_MAX_TG)) {
    const factor = martinHopkinsFactor(triglycerides, nonHdl);
    values.ldl_mg_dl = round2(nonHdl - triglycerides / factor);
    values.martin_factor = factor;
  }
  values.non_hdl_mg_dl = round2(nonHdl);

  return values;
}

/** Valores desejáveis para adultos (SBC, 2017): CT < 190, HDL-c > 40, TG < 150 em jejum (< 175 sem jejum). */
export function perfilLipidicoClassifier(_result: Record<string, number>, inputs: PerfilLipidicoInputs): string {
  const triglyceridesLimit = inputs.fasting ? 150 : 175;
  const desirable = inputs.total_cholesterol_mg_dl < 190 && inputs.hdl_mg_dl > 40 && inputs.triglycerides_mg_dl < triglyceridesLimit;

  return desirable ? 'perfil_desejavel' : 'perfil_alterado';
}

export const perfilLipidicoCalculator = makeCalculator<PerfilLipidicoInputs>({
  slug: 'perfil-lipidico',
  module: 'bioquimica',
  category: 'perfil_lipidico',
  version: 'v2',
  reference: {
    method: 'LDL-c (Martin/Hopkins), não-HDL-c e valores referenciais desejáveis',
    citation: 'SBC, Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose – 2025, Arq Bras Cardiol, 2025 (Martin/Hopkins para todos; valores desejáveis iguais aos de 2017); Martin SS et al., JAMA, 2013;310(19):2061-2068; tabela de fatores: Faludi AA et al., Atualização da Diretriz Brasileira de Dislipidemias – 2017, Tabela 1.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: perfilLipidicoFormula,
  classifier: perfilLipidicoClassifier,
});
