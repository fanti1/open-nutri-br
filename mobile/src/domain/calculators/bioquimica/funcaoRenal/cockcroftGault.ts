import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface CockcroftGaultInputs {
  creatinine_mg_dl: number;
  age_years: number;
  weight_kg: number;
  sex: 'male' | 'female';
}

/** Clearance (mL/min) = (140 − idade) × peso / (72 × Scr) × 0,85 se mulher. Cockcroft & Gault, 1976. */
export function cockcroftGaultFormula(inputs: CockcroftGaultInputs): Record<string, number> {
  const clearance = ((140 - inputs.age_years) * inputs.weight_kg) / (72 * inputs.creatinine_mg_dl);

  return { crcl_ml_min: round2(inputs.sex === 'female' ? clearance * 0.85 : clearance) };
}

export const cockcroftGaultCalculator = makeCalculator<CockcroftGaultInputs>({
  slug: 'cockcroft-gault',
  module: 'bioquimica',
  category: 'funcao_renal',
  version: 'v1',
  reference: {
    method: 'Clearance de creatinina estimado (Cockcroft-Gault)',
    citation: 'Cockcroft DW, Gault MH, Prediction of creatinine clearance from serum creatinine, Nephron, 1976.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: cockcroftGaultFormula,
});
