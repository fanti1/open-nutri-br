import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface SchofieldInputs {
  age_years: number;
  sex: 'male' | 'female';
  weight_kg: number;
}

/** [idade mínima (anos, inclusiva), a, b] — TMB = a × peso + b. */
const COEFFICIENTS: Record<SchofieldInputs['sex'], Array<[number, number, number]>> = {
  male: [
    [0, 59.512, -30.4],
    [3, 22.706, 504.3],
    [10, 17.686, 658.2],
    [18, 15.057, 692.2],
    [30, 11.472, 873.1],
    [60, 11.711, 587.7],
  ],
  female: [
    [0, 58.317, -31.1],
    [3, 20.315, 485.9],
    [10, 13.384, 692.6],
    [18, 14.818, 486.6],
    [30, 8.126, 845.6],
    [60, 9.082, 658.5],
  ],
};

/**
 * Reference: Schofield WN, Hum Nutr Clin Nutr, 1985; coeficientes conforme
 * FAO/WHO/UNU, Human Energy Requirements, 2004, Tabela 5.2.
 */
export function schofieldFormula(inputs: SchofieldInputs): Record<string, number> {
  const bands = COEFFICIENTS[inputs.sex].filter(([minAge]) => inputs.age_years >= minAge);
  const [, a, b] = bands[bands.length - 1];

  return { bmr_kcal: round2(a * inputs.weight_kg + b) };
}

export const schofieldCalculator = makeCalculator<SchofieldInputs>({
  slug: 'schofield',
  // Todas as faixas etárias: fica em Consultório → Metabolismo.
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v1',
  reference: {
    method: 'Taxa Metabólica Basal (Schofield, por peso)',
    citation: 'Schofield WN, Hum Nutr Clin Nutr, 1985; FAO/WHO/UNU, Human Energy Requirements, 2004, Tabela 5.2.',
  },
  lifeStages: ['crianca', 'adulto', 'idoso'],
  formula: schofieldFormula,
});
