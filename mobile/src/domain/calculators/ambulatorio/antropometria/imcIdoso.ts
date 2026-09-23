import { makeCalculator } from '../../support/makeCalculator';
import { imcFormula, type ImcInputs } from './imc';

/**
 * IMC do idoso (≥ 60 anos), cortes do SISVAN (Lipschitz, 1994): ≤ 22,0 baixo
 * peso; > 22,0 e < 27,0 peso adequado; ≥ 27,0 sobrepeso.
 */
export function imcIdosoClassifier(result: Record<string, number>): string {
  if (result.value <= 22.0) return 'baixo_peso';
  if (result.value < 27.0) return 'eutrofia';
  return 'sobrepeso';
}

export const imcIdosoCalculator = makeCalculator<ImcInputs>({
  slug: 'imc-idoso',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v1',
  reference: {
    method: 'Índice de Massa Corporal do idoso (pontos de corte de Lipschitz)',
    citation: 'Lipschitz DA, Screening for nutritional status in the elderly, Prim Care, 1994; adotado pelo Ministério da Saúde no SISVAN para pessoas com 60 anos ou mais.',
  },
  lifeStages: ['idoso'],
  formula: imcFormula,
  classifier: imcIdosoClassifier,
});
