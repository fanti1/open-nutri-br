import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export type ChildActivityLevel = 'leve' | 'moderada' | 'intensa';

export interface NecessidadeEnergeticaInfantilInputs {
  age_years: number;
  sex: 'male' | 'female';
  weight_kg: number;
  activity_level: ChildActivityLevel;
}

/** kcal/kg/dia por idade (anos completos, 1–17) e atividade (leve, moderada, intensa). */
const KCAL_PER_KG: Record<NecessidadeEnergeticaInfantilInputs['sex'], Record<number, [number, number, number]>> = {
  male: {
    1: [82, 82, 82], 2: [84, 84, 84], 3: [80, 80, 80], 4: [77, 77, 77], 5: [74, 74, 74],
    6: [62, 73, 84], 7: [60, 71, 81], 8: [59, 69, 79], 9: [56, 67, 76], 10: [55, 65, 74],
    11: [53, 62, 72], 12: [51, 60, 69], 13: [49, 58, 66], 14: [48, 56, 65], 15: [45, 53, 62],
    16: [44, 52, 59], 17: [43, 50, 57],
  },
  female: {
    1: [80, 80, 80], 2: [81, 81, 81], 3: [77, 77, 77], 4: [74, 74, 74], 5: [72, 72, 72],
    6: [59, 69, 80], 7: [57, 67, 77], 8: [54, 64, 73], 9: [52, 61, 70], 10: [49, 58, 66],
    11: [47, 55, 63], 12: [44, 52, 60], 13: [42, 49, 57], 14: [40, 47, 54], 15: [39, 45, 52],
    16: [38, 44, 51], 17: [37, 44, 51],
  },
};

const ACTIVITY_INDEX: Record<ChildActivityLevel, number> = { leve: 0, moderada: 1, intensa: 2 };

/** Reference: FAO/WHO/UNU, Human Energy Requirements, 2004, Tabelas 4.5 e 4.6. */
export function necessidadeEnergeticaInfantilFormula(
  inputs: NecessidadeEnergeticaInfantilInputs,
): Record<string, number> {
  const kcalPerKg = KCAL_PER_KG[inputs.sex][Math.floor(inputs.age_years)][ACTIVITY_INDEX[inputs.activity_level]];

  return { kcal_per_kg: kcalPerKg, kcal_per_day: round2(kcalPerKg * inputs.weight_kg) };
}

export const necessidadeEnergeticaInfantilCalculator = makeCalculator<NecessidadeEnergeticaInfantilInputs>({
  slug: 'necessidade-energetica-infantil',
  module: 'pediatria',
  category: 'gasto_energetico',
  version: 'v1',
  reference: {
    method: 'Necessidade Energética de Crianças e Adolescentes (1–18 anos)',
    citation: 'FAO/WHO/UNU, Human Energy Requirements, 2004, Tabelas 4.5 e 4.6.',
  },
  lifeStages: ['crianca'],
  formula: necessidadeEnergeticaInfantilFormula,
});
