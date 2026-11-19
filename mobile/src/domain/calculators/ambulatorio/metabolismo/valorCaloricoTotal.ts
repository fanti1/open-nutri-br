import { reaches } from '../../support/cutoff';
import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface ValorCaloricoTotalInputs {
  bmr_kcal: number;
  /** Nível de atividade física (PAL), de 1,40 a 2,40 — FAO/WHO/UNU, Tabela 5.3. */
  pal: number;
}

/** VCT = TMB × PAL (FAO/WHO/UNU, Human Energy Requirements, 2004, seção 5.4.1). */
export function valorCaloricoTotalFormula(inputs: ValorCaloricoTotalInputs): Record<string, number> {
  return { vct_kcal: round2(inputs.bmr_kcal * inputs.pal) };
}

/** Estilo de vida correspondente ao PAL (Tabela 5.3): 1,40–1,69 · 1,70–1,99 · 2,00–2,40. */
export function valorCaloricoTotalClassifier(_result: Record<string, number>, inputs: ValorCaloricoTotalInputs): string {
  if (reaches(inputs.pal, 2.0)) return 'vigorosamente_ativo';
  if (reaches(inputs.pal, 1.7)) return 'ativo_ou_moderadamente_ativo';
  return 'sedentario_ou_atividade_leve';
}

export const valorCaloricoTotalCalculator = makeCalculator<ValorCaloricoTotalInputs>({
  slug: 'valor-calorico-total',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v2',
  reference: {
    method: 'Valor Calórico Total (VCT) = TMB × PAL',
    citation: 'FAO/WHO/UNU, Human Energy Requirements: Report of a Joint FAO/WHO/UNU Expert Consultation (2001), FAO Food and Nutrition Technical Report Series 1, 2004 — Tabela 5.3.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: valorCaloricoTotalFormula,
  classifier: valorCaloricoTotalClassifier,
});
