import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface TorontoInputs {
  burned_body_surface_percent: number;
  caloric_intake_kcal: number;
  harris_benedict_kcal: number;
  temperature_c: number;
  post_burn_day: number;
}

/** GER = −4343 + 10,5·%SCQ + 0,23·ingestão + 0,84·Harris-Benedict + 114·T − 4,5·dias pós-queimadura. Allard et al., 1990. */
export function torontoFormula(inputs: TorontoInputs): Record<string, number> {
  const ree =
    -4343 +
    10.5 * inputs.burned_body_surface_percent +
    0.23 * inputs.caloric_intake_kcal +
    0.84 * inputs.harris_benedict_kcal +
    114 * inputs.temperature_c -
    4.5 * inputs.post_burn_day;

  return { ree_kcal: round2(ree) };
}

export const torontoCalculator = makeCalculator<TorontoInputs>({
  slug: 'toronto',
  module: 'hospitalar',
  category: 'gasto_energetico',
  version: 'v1',
  reference: {
    method: 'Gasto energético de repouso em queimados (Fórmula de Toronto)',
    citation: 'Allard JP et al., JPEN, 1990.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: torontoFormula,
});
