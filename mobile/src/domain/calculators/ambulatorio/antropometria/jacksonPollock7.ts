import { makeCalculator } from '../../support/makeCalculator';
import { skinfoldBodyFat } from './skinfoldBodyFat';

const SITES = [
  'skinfold_chest_mm',
  'skinfold_midaxillary_mm',
  'skinfold_triceps_mm',
  'skinfold_subscapular_mm',
  'skinfold_abdominal_mm',
  'skinfold_suprailiac_mm',
  'skinfold_thigh_mm',
] as const;

export type JacksonPollock7Inputs = { sex: 'male' | 'female'; age_years: number } & Record<(typeof SITES)[number], number>;

/**
 * Homens (1978): D = 1,112 − 0,00043499·Σ + 0,00000055·Σ² − 0,00028826·idade
 * Mulheres (1980): D = 1,097 − 0,00046971·Σ + 0,00000056·Σ² − 0,00012828·idade
 */
export function jacksonPollock7Formula(inputs: JacksonPollock7Inputs): Record<string, number> {
  const sum = SITES.reduce((total, site) => total + inputs[site], 0);
  const age = inputs.age_years;

  const density =
    inputs.sex === 'male'
      ? 1.112 - 0.00043499 * sum + 0.00000055 * sum ** 2 - 0.00028826 * age
      : 1.097 - 0.00046971 * sum + 0.00000056 * sum ** 2 - 0.00012828 * age;

  return skinfoldBodyFat(density, sum);
}

export const jacksonPollock7Calculator = makeCalculator<JacksonPollock7Inputs>({
  slug: 'jackson-pollock-7',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v1',
  reference: {
    method: '% de gordura por 7 dobras cutâneas (Jackson-Pollock) e equação de Siri',
    citation: 'Jackson AS, Pollock ML, Br J Nutr, 1978; Jackson AS, Pollock ML, Ward A, Med Sci Sports Exerc, 1980; Siri WE, 1961.',
  },
  lifeStages: ['adulto'],
  formula: jacksonPollock7Formula,
});
