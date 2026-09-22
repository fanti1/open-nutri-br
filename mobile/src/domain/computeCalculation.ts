import { calculateOnServer } from '../api/calculators';
import { getCalculator } from './calculators/registry';
import type { CalculationOutcome } from './calculators/types';

/** Calculadoras com implementação no app funcionam offline e em tempo real. */
export function isLocalCalculator(slug: string): boolean {
  return getCalculator(slug) !== undefined;
}

/** Cálculo síncrono das calculadoras locais — permite mostrar o resultado a cada tecla. */
export function computeLocally(slug: string, inputs: Record<string, unknown>): CalculationOutcome {
  const calculator = getCalculator(slug);
  if (!calculator) throw new Error(`Calculadora ${slug} não tem implementação local.`);
  return calculator.calculate(inputs);
}

/**
 * Calcula no aparelho quando possível; senão (curvas da OMS, que dependem de
 * ~18 mil linhas de tabela) pede ao servidor — enviando só as medidas, sem
 * nenhum dado que identifique o paciente.
 */
export async function computeCalculation(slug: string, inputs: Record<string, unknown>): Promise<CalculationOutcome> {
  const local = getCalculator(slug);
  if (local) return local.calculate(inputs);

  const result = await calculateOnServer(slug, inputs);
  return { values: result.values, classification: result.classification, formulaVersion: result.formula_version };
}
