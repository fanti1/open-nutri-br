import { getCalculator } from './calculators/registry';
import type { CalculationOutcome } from './calculators/types';

/**
 * Calcula no aparelho — todas as calculadoras, inclusive as curvas da OMS
 * (tabelas oficiais embarcadas), funcionam sem internet e em tempo real.
 */
export function computeLocally(slug: string, inputs: Record<string, unknown>): CalculationOutcome {
  const calculator = getCalculator(slug);
  if (!calculator) throw new Error(`Calculadora ${slug} não encontrada.`);
  return calculator.calculate(inputs);
}
