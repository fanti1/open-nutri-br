import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface DietaEnteralInputs {
  target_volume_ml: number;
  infusion_duration_hours: number;
}

/** Taxa (mL/h) = volume-alvo / duração. ASPEN/BRASPEN Guidelines for Enteral Nutrition. */
export function dietaEnteralFormula(inputs: DietaEnteralInputs): Record<string, number> {
  return { rate_ml_per_hour: round2(inputs.target_volume_ml / inputs.infusion_duration_hours) };
}

export const dietaEnteralCalculator = makeCalculator<DietaEnteralInputs>({
  slug: 'dieta-enteral',
  module: 'hospitalar',
  category: 'suporte_nutricional',
  version: 'v1',
  reference: {
    method: 'Dieta Enteral (taxa de infusão)',
    citation: 'ASPEN/BRASPEN Guidelines for Enteral Nutrition.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: dietaEnteralFormula,
});
