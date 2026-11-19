import { reaches } from '../../support/cutoff';
import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';
import { IncompleteInputsError } from '../../types';

export type SmokingStatus =
  | 'nao_fuma'
  | 'fuma_quantidade_desconhecida'
  | 'menos_de_10_cigarros_dia'
  | '10_a_19_cigarros_dia'
  | '20_ou_mais_cigarros_dia';

export interface AnemiaOmsInputs {
  age_years: number;
  sex: 'male' | 'female';
  pregnant: boolean;
  pregnancy_trimester?: 1 | 2 | 3 | null;
  hemoglobin_g_dl: number;
  altitude_m?: number | null;
  smoking?: SmokingStatus | null;
}

/**
 * Cortes de hemoglobina (g/dL) da OMS, 2024 — Tabela 3:
 * [sem anemia a partir de, leve a partir de, moderada a partir de]; abaixo é grave.
 */
export function anemiaCutoffs(inputs: AnemiaOmsInputs): [number, number, number] {
  if (inputs.sex === 'female' && inputs.pregnant) {
    if (!inputs.pregnancy_trimester) throw new IncompleteInputsError('Informe o trimestre da gestação.');
    return inputs.pregnancy_trimester === 2 ? [10.5, 9.5, 7.0] : [11.0, 10.0, 7.0];
  }
  if (inputs.age_years < 2) return [10.5, 9.5, 7.0]; // 6–23 meses
  if (inputs.age_years < 5) return [11.0, 10.0, 7.0]; // 24–59 meses
  if (inputs.age_years < 12) return [11.5, 11.0, 8.0]; // 5–11 anos
  if (inputs.age_years < 15) return [12.0, 11.0, 8.0]; // 12–14 anos
  if (inputs.sex === 'female') return [12.0, 11.0, 8.0];
  return [13.0, 11.0, 8.0];
}

/** Tabela 4: ajuste (g/L) por faixa de 500 m de altitude da residência, de 0 m a 4.999 m. */
const ALTITUDE_ADJUSTMENT_G_L = [0, 4, 8, 11, 14, 18, 21, 25, 29, 33];

/** Tabela 5: ajuste (g/L) pelo tabagismo. */
const SMOKING_ADJUSTMENT_G_L: Record<SmokingStatus, number> = {
  nao_fuma: 0,
  fuma_quantidade_desconhecida: 3,
  menos_de_10_cigarros_dia: 3,
  '10_a_19_cigarros_dia': 5,
  '20_ou_mais_cigarros_dia': 6,
};

/** Quanto subtrair (g/dL) da hemoglobina observada pela altitude e pelo tabagismo (OMS, 2024). */
export function hemoglobinAdjustment(inputs: AnemiaOmsInputs): number {
  const altitude = inputs.altitude_m ? ALTITUDE_ADJUSTMENT_G_L[Math.floor(inputs.altitude_m / 500)] : 0;
  const smoking = inputs.smoking ? SMOKING_ADJUSTMENT_G_L[inputs.smoking] : 0;
  return (altitude + smoking) / 10;
}

export function anemiaOmsFormula(inputs: AnemiaOmsInputs): Record<string, number> {
  const adjustment = hemoglobinAdjustment(inputs);
  const values: Record<string, number> = { hemoglobin_g_dl: inputs.hemoglobin_g_dl };

  if (adjustment > 0) {
    values.hemoglobin_adjustment_g_dl = adjustment;
    values.adjusted_hemoglobin_g_dl = round2(inputs.hemoglobin_g_dl - adjustment);
  }
  values.anemia_cutoff_g_dl = anemiaCutoffs(inputs)[0];

  return values;
}

export function anemiaOmsClassifier(result: Record<string, number>, inputs: AnemiaOmsInputs): string {
  const [none, mild, moderate] = anemiaCutoffs(inputs);
  const hemoglobin = result.adjusted_hemoglobin_g_dl ?? result.hemoglobin_g_dl;
  if (reaches(hemoglobin, none)) return 'sem_anemia';
  if (reaches(hemoglobin, mild)) return 'anemia_leve';
  if (reaches(hemoglobin, moderate)) return 'anemia_moderada';
  return 'anemia_grave';
}

export const anemiaOmsCalculator = makeCalculator<AnemiaOmsInputs>({
  slug: 'anemia-oms',
  module: 'bioquimica',
  category: 'hematologia',
  version: 'v2',
  reference: {
    method: 'Diagnóstico e gravidade da anemia pela hemoglobina (OMS)',
    citation: 'World Health Organization, Guideline on haemoglobin cutoffs to define anaemia in individuals and populations, Geneva, 2024 (Tabelas 3, 4 e 5).',
  },
  lifeStages: ['crianca', 'adulto', 'idoso'],
  formula: anemiaOmsFormula,
  classifier: anemiaOmsClassifier,
});
