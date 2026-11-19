import { makeCalculator } from '../../support/makeCalculator';
import { skinfoldBodyFat } from './skinfoldBodyFat';

export interface DurninWomersleyInputs {
  sex: 'male' | 'female';
  age_years: number;
  skinfold_biceps_mm: number;
  skinfold_triceps_mm: number;
  skinfold_subscapular_mm: number;
  skinfold_suprailiac_mm: number;
}

/** [idade mínima, c, m] por sexo — Durnin & Womersley, 1974. */
const COEFFICIENTS: Record<DurninWomersleyInputs['sex'], [number, number, number][]> = {
  male: [
    [17, 1.162, 0.063],
    [20, 1.1631, 0.0632],
    [30, 1.1422, 0.0544],
    [40, 1.162, 0.07],
    [50, 1.1715, 0.0779],
  ],
  female: [
    [17, 1.1549, 0.0678],
    [20, 1.1599, 0.0717],
    [30, 1.1423, 0.0632],
    [40, 1.1333, 0.0612],
    [50, 1.1339, 0.0645],
  ],
};

/** D = c − m × log10(Σ bíceps + tríceps + subescapular + suprailíaca); % de gordura por Siri. */
export function durninWomersleyFormula(inputs: DurninWomersleyInputs): Record<string, number> {
  const sum = inputs.skinfold_biceps_mm + inputs.skinfold_triceps_mm + inputs.skinfold_subscapular_mm + inputs.skinfold_suprailiac_mm;
  const rows = COEFFICIENTS[inputs.sex];
  const [, c, m] = rows.filter(([minAge]) => inputs.age_years >= minAge).pop() ?? rows[0];

  return skinfoldBodyFat(c - m * Math.log10(sum), sum);
}

export const durninWomersleyCalculator = makeCalculator<DurninWomersleyInputs>({
  slug: 'durnin-womersley',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v1',
  reference: {
    method: '% de gordura por 4 dobras cutâneas (Durnin-Womersley) e equação de Siri',
    citation: 'Durnin JVGA, Womersley J, Br J Nutr, 1974; Siri WE, 1961.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: durninWomersleyFormula,
});
