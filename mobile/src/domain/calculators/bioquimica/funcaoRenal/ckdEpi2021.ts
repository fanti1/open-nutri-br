import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface CkdEpi2021Inputs {
  creatinine_mg_dl: number;
  age_years: number;
  sex: 'male' | 'female';
}

/**
 * CKD-EPI 2021 (Inker et al., NEJM 2021), sem coeficiente de raça:
 * 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1,200 × 0,9938^idade × 1,012 [mulher]
 * κ = 0,7 (M) / 0,9 (H); α = −0,241 (M) / −0,302 (H). mL/min/1,73 m².
 */
export function ckdEpi2021Formula(inputs: CkdEpi2021Inputs): Record<string, number> {
  const female = inputs.sex === 'female';
  const kappa = female ? 0.7 : 0.9;
  const alpha = female ? -0.241 : -0.302;
  const ratio = inputs.creatinine_mg_dl / kappa;

  const egfr =
    142 * Math.min(ratio, 1) ** alpha * Math.max(ratio, 1) ** -1.2 * 0.9938 ** inputs.age_years * (female ? 1.012 : 1);

  return { egfr_ml_min_173m2: round2(egfr) };
}

/** Categorias de TFG da KDIGO (2012). */
export function ckdEpi2021Classifier(result: Record<string, number>): string {
  const egfr = result.egfr_ml_min_173m2;
  if (egfr >= 90) return 'g1_normal_ou_elevada';
  if (egfr >= 60) return 'g2_levemente_diminuida';
  if (egfr >= 45) return 'g3a_leve_a_moderadamente_diminuida';
  if (egfr >= 30) return 'g3b_moderada_a_gravemente_diminuida';
  if (egfr >= 15) return 'g4_gravemente_diminuida';
  return 'g5_falencia_renal';
}

export const ckdEpi2021Calculator = makeCalculator<CkdEpi2021Inputs>({
  slug: 'ckd-epi-2021',
  module: 'bioquimica',
  category: 'funcao_renal',
  version: 'v1',
  reference: {
    method: 'Taxa de filtração glomerular estimada — CKD-EPI 2021 (creatinina, sem raça)',
    citation: 'Inker LA et al., N Engl J Med, 2021; categorias: KDIGO 2012, Kidney Int Suppl, 2013.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: ckdEpi2021Formula,
  classifier: ckdEpi2021Classifier,
});
