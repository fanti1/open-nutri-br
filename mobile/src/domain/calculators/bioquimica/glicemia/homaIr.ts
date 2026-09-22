import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface HomaIrInputs {
  fasting_glucose_mg_dl: number;
  fasting_insulin_uui_ml: number;
}

/** Ponto de corte validado em adultos brasileiros (Geloneze et al., BRAMS, 2006). */
export const HOMA_IR_CUTOFF = 2.71;

/** HOMA-IR = glicemia de jejum (mg/dL) × insulina de jejum (µUI/mL) / 405. Matthews et al., 1985. */
export function homaIrFormula(inputs: HomaIrInputs): Record<string, number> {
  return { homa_ir: round2((inputs.fasting_glucose_mg_dl * inputs.fasting_insulin_uui_ml) / 405) };
}

export function homaIrClassifier(result: Record<string, number>): string {
  return result.homa_ir > HOMA_IR_CUTOFF ? 'resistencia_insulinica' : 'sem_resistencia_insulinica';
}

export const homaIrCalculator = makeCalculator<HomaIrInputs>({
  slug: 'homa-ir',
  module: 'bioquimica',
  category: 'glicemia',
  version: 'v1',
  reference: {
    method: 'HOMA-IR (Homeostasis Model Assessment)',
    citation: 'Matthews DR et al., Diabetologia, 1985; ponto de corte brasileiro: Geloneze B et al., BRAMS, Diabetes Res Clin Pract, 2006.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: homaIrFormula,
  classifier: homaIrClassifier,
});
