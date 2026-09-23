import { makeCalculator } from '../../support/makeCalculator';
import { skinfoldBodyFat } from './skinfoldBodyFat';

export interface JacksonPollock3Inputs {
  sex: 'male' | 'female';
  age_years: number;
  skinfold_chest_mm?: number;
  skinfold_abdominal_mm?: number;
  skinfold_triceps_mm?: number;
  skinfold_suprailiac_mm?: number;
  skinfold_thigh_mm: number;
}

/**
 * Homens — peitoral, abdominal, coxa (Jackson & Pollock, 1978):
 *   D = 1,10938 − 0,0008267·Σ + 0,0000016·Σ² − 0,0002574·idade
 * Mulheres — tríceps, suprailíaca, coxa (Jackson, Pollock & Ward, 1980):
 *   D = 1,0994921 − 0,0009929·Σ + 0,0000023·Σ² − 0,0001392·idade
 */
export function jacksonPollock3Formula(inputs: JacksonPollock3Inputs): Record<string, number> {
  const age = inputs.age_years;

  if (inputs.sex === 'male') {
    const sum = (inputs.skinfold_chest_mm ?? 0) + (inputs.skinfold_abdominal_mm ?? 0) + inputs.skinfold_thigh_mm;
    return skinfoldBodyFat(1.10938 - 0.0008267 * sum + 0.0000016 * sum ** 2 - 0.0002574 * age, sum);
  }

  const sum = (inputs.skinfold_triceps_mm ?? 0) + (inputs.skinfold_suprailiac_mm ?? 0) + inputs.skinfold_thigh_mm;
  return skinfoldBodyFat(1.0994921 - 0.0009929 * sum + 0.0000023 * sum ** 2 - 0.0001392 * age, sum);
}

export const jacksonPollock3Calculator = makeCalculator<JacksonPollock3Inputs>({
  slug: 'jackson-pollock-3',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v1',
  reference: {
    method: '% de gordura por 3 dobras cutâneas (Jackson-Pollock) e equação de Siri',
    citation: 'Jackson AS, Pollock ML, Br J Nutr, 1978; Jackson AS, Pollock ML, Ward A, Med Sci Sports Exerc, 1980; Siri WE, 1961.',
  },
  lifeStages: ['adulto'],
  formula: jacksonPollock3Formula,
});
