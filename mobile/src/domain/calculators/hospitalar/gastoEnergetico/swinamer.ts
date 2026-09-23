import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface SwinamerInputs {
  body_surface_area_m2: number;
  age_years: number;
  temperature_c: number;
  respiratory_rate: number;
  tidal_volume_l: number;
}

/** GE = 945·SC − 6,4·idade + 108·T + 24,2·f + 817·VC(L) − 4349. Swinamer et al., 1990. */
export function swinamerFormula(inputs: SwinamerInputs): Record<string, number> {
  const ree =
    945 * inputs.body_surface_area_m2 -
    6.4 * inputs.age_years +
    108 * inputs.temperature_c +
    24.2 * inputs.respiratory_rate +
    817 * inputs.tidal_volume_l -
    4349;

  return { ree_kcal: round2(ree) };
}

export const swinamerCalculator = makeCalculator<SwinamerInputs>({
  slug: 'swinamer',
  module: 'hospitalar',
  category: 'gasto_energetico',
  version: 'v1',
  reference: {
    method: 'Gasto energético em ventilação mecânica (Swinamer)',
    citation: 'Swinamer DL et al., Crit Care Med, 1990.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: swinamerFormula,
});
