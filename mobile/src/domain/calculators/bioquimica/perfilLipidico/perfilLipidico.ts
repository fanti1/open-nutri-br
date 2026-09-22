import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface PerfilLipidicoInputs {
  total_cholesterol_mg_dl: number;
  hdl_mg_dl: number;
  triglycerides_mg_dl: number;
  fasting: boolean;
}

/** Friedewald não é válida a partir deste valor de triglicerídeos (mg/dL). */
export const FRIEDEWALD_MAX_TG = 400;

/**
 * LDL-c (Friedewald, 1972) = CT − HDL-c − TG/5, só com TG < 400 mg/dL (acima
 * disso fica de fora do resultado). Não-HDL-c = CT − HDL-c.
 */
export function perfilLipidicoFormula(inputs: PerfilLipidicoInputs): Record<string, number> {
  const { total_cholesterol_mg_dl: total, hdl_mg_dl: hdl, triglycerides_mg_dl: triglycerides } = inputs;
  const values: Record<string, number> = {};

  if (triglycerides < FRIEDEWALD_MAX_TG) values.ldl_mg_dl = round2(total - hdl - triglycerides / 5);
  values.non_hdl_mg_dl = round2(total - hdl);

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
  version: 'v1',
  reference: {
    method: 'LDL-c (Friedewald), não-HDL-c e valores referenciais desejáveis',
    citation: 'Faludi AA et al., Atualização da Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose – 2017, Arq Bras Cardiol, 2017; Friedewald WT et al., Clin Chem, 1972.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: perfilLipidicoFormula,
  classifier: perfilLipidicoClassifier,
});
