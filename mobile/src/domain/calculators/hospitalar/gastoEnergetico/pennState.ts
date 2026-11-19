import { reaches } from '../../support/cutoff';
import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface PennStateInputs {
  weight_kg: number;
  height_cm: number;
  age_years: number;
  sex: 'male' | 'female';
  minute_ventilation_l_min: number;
  max_temperature_c: number;
}

/** A versão 2010 foi validada para ≥ 60 anos com IMC ≥ 30 (Frankenfield, JPEN 2011). */
export function usesOlderObeseVersion(age: number, bmi: number): boolean {
  return age >= 60 && reaches(bmi, 30);
}

function bmiOf(inputs: PennStateInputs): number {
  return inputs.weight_kg / (inputs.height_cm / 100) ** 2;
}

/**
 * Mifflin-St Jeor (peso atual); Ve em L/min; Tmax = máxima em 24 h (°C).
 *   2003b: 0,96·Mifflin + 31·Ve + 167·Tmax − 6212
 *   2010:  0,71·Mifflin + 85·Tmax + 64·Ve − 3085
 */
export function pennStateFormula(inputs: PennStateInputs): Record<string, number> {
  const mifflin = 10 * inputs.weight_kg + 6.25 * inputs.height_cm - 5 * inputs.age_years + (inputs.sex === 'male' ? 5 : -161);
  const bmi = bmiOf(inputs);
  const ve = inputs.minute_ventilation_l_min;
  const tmax = inputs.max_temperature_c;

  const ree = usesOlderObeseVersion(inputs.age_years, bmi)
    ? 0.71 * mifflin + 85 * tmax + 64 * ve - 3085
    : 0.96 * mifflin + 31 * ve + 167 * tmax - 6212;

  return { ree_kcal: round2(ree), mifflin_kcal: round2(mifflin), bmi: round2(bmi) };
}

/**
 * Informa qual versão foi aplicada — com o mesmo IMC (sem arredondar) que a
 * fórmula usou: com IMC 29,997 a fórmula aplica a 2003b, e o IMC exibido
 * (30,00) não pode fazer o rótulo dizer 2010.
 */
export function pennStateClassifier(_result: Record<string, number>, inputs: PennStateInputs): string {
  return usesOlderObeseVersion(inputs.age_years, bmiOf(inputs)) ? 'equacao_2010_idoso_com_obesidade' : 'equacao_2003b';
}

export const pennStateCalculator = makeCalculator<PennStateInputs>({
  slug: 'penn-state',
  module: 'hospitalar',
  category: 'gasto_energetico',
  version: 'v1',
  reference: {
    method: 'Gasto energético de repouso em ventilação mecânica (Penn State 2003b / 2010)',
    citation: 'Frankenfield D et al., JPEN, 2004 e 2009; Frankenfield D, JPEN, 2011.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: pennStateFormula,
  classifier: pennStateClassifier,
});
