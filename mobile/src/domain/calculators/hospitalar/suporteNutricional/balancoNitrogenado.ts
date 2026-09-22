import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface BalancoNitrogenadoInputs {
  protein_intake_g: number;
  urinary_urea_nitrogen_24h_g: number;
}

const PROTEIN_TO_NITROGEN_FACTOR = 6.25;
const NON_UREIC_LOSSES_G = 4;

/** BN = (proteína/6.25) − (UUN24h + 4). Reference: Blackburn GL et al., JPEN, 1977. */
export function balancoNitrogenadoFormula(inputs: BalancoNitrogenadoInputs): Record<string, number> {
  const nitrogenIntake = inputs.protein_intake_g / PROTEIN_TO_NITROGEN_FACTOR;
  const balance = nitrogenIntake - (inputs.urinary_urea_nitrogen_24h_g + NON_UREIC_LOSSES_G);

  return { balance_g_per_day: round2(balance) };
}

export function balancoNitrogenadoClassifier(result: Record<string, number>): string {
  if (result.balance_g_per_day > 0) return 'balanco_positivo';
  if (result.balance_g_per_day < 0) return 'balanco_negativo';
  return 'balanco_neutro';
}

export const balancoNitrogenadoCalculator = makeCalculator<BalancoNitrogenadoInputs>({
  slug: 'balanco-nitrogenado',
  module: 'hospitalar',
  category: 'suporte_nutricional',
  version: 'v1',
  reference: {
    method: 'Balanço Nitrogenado',
    citation: 'Blackburn GL et al., JPEN, 1977.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: balancoNitrogenadoFormula,
  classifier: balancoNitrogenadoClassifier,
});
