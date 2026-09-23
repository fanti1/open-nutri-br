import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface ImcInputs {
  weight_kg: number;
  height_m: number;
}

/** IMC = peso(kg) / altura(m)^2. Reference: WHO Technical Report Series 894, 2000. */
export function imcFormula(inputs: ImcInputs): Record<string, number> {
  return { value: round2(inputs.weight_kg / inputs.height_m ** 2) };
}

/** Classification bands per WHO Technical Report Series 894, 2000. */
export function imcClassifier(result: Record<string, number>): string {
  const value = result.value;

  if (value < 18.5) return 'baixo_peso';
  if (value < 25.0) return 'eutrofia';
  if (value < 30.0) return 'sobrepeso';

  return 'obesidade';
}

export const imcCalculator = makeCalculator<ImcInputs>({
  slug: 'imc',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v1',
  reference: {
    method: 'Índice de Massa Corporal (IMC)',
    citation:
      'World Health Organization, Obesity: Preventing and Managing the Global Epidemic, WHO Technical Report Series 894, 2000.',
  },
  // Adultos (20–59 anos); idosos usam o IMC com cortes de Lipschitz (imc-idoso).
  lifeStages: ['adulto'],
  formula: imcFormula,
  classifier: imcClassifier,
});
