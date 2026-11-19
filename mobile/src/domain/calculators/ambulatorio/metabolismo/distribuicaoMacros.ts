import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';
import { IncompleteInputsError } from '../../types';

export interface DistribuicaoMacrosInputs {
  total_kcal: number;
  carb_percent: number;
  protein_percent: number;
  fat_percent: number;
}

const KCAL_PER_G_CARB_OR_PROTEIN = 4;
const KCAL_PER_G_FAT = 9;

/**
 * Converte percentuais de macronutrientes (faixas AMDR) em gramas/dia.
 * Reference: Institute of Medicine, Dietary Reference Intakes (AMDR), 2005.
 */
export function distribuicaoMacrosFormula(inputs: DistribuicaoMacrosInputs): Record<string, number> {
  const { total_kcal, carb_percent, protein_percent, fat_percent } = inputs;

  // Uma distribuição reparte o VCT inteiro: os três percentuais somam 100%.
  const sum = carb_percent + protein_percent + fat_percent;
  if (Math.abs(sum - 100) > 1e-6) {
    throw new IncompleteInputsError(
      `A soma de carboidratos, proteínas e lipídios precisa ser 100% (está em ${String(round2(sum)).replace('.', ',')}%).`,
    );
  }

  return {
    carbohydrate_g: round2(((total_kcal * carb_percent) / 100) / KCAL_PER_G_CARB_OR_PROTEIN),
    protein_g: round2(((total_kcal * protein_percent) / 100) / KCAL_PER_G_CARB_OR_PROTEIN),
    fat_g: round2(((total_kcal * fat_percent) / 100) / KCAL_PER_G_FAT),
  };
}

export const distribuicaoMacrosCalculator = makeCalculator<DistribuicaoMacrosInputs>({
  slug: 'distribuicao-macros',
  module: 'ambulatorio',
  category: 'metabolismo',
  version: 'v1',
  reference: {
    method: 'Distribuição de Macronutrientes (AMDR)',
    citation: 'Institute of Medicine, Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Protein and Amino Acids (AMDR), 2005.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: distribuicaoMacrosFormula,
});
