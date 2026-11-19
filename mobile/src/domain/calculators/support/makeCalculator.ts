import {
  InvalidResultError,
  type Calculator,
  type CalculatorReference,
  type Classifier,
  type Formula,
  type LifeStage,
} from '../types';

interface CalculatorConfig<TInputs> {
  slug: string;
  module: string;
  category: string;
  version: string;
  reference: CalculatorReference;
  lifeStages: LifeStage[];
  formula: Formula<TInputs>;
  classifier?: Classifier<TInputs>;
}

/** Todo valor de saída precisa ser um número finito — senão o resultado não é mostrado nem salvo. */
function assertFiniteValues(values: Record<string, unknown>): asserts values is Record<string, number> {
  for (const value of Object.values(values)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new InvalidResultError();
  }
}

/**
 * Wires a Formula and an optional Classifier together — the TS equivalent of
 * backend AbstractCalculator. Keeping this the only place calculate() is
 * implemented means formula/classifier stay independently unit-testable pure
 * functions, every calculator's metadata lives in one small config object,
 * and the output guard below covers all of them.
 */
export function makeCalculator<TInputs>(config: CalculatorConfig<TInputs>): Calculator<TInputs> {
  return {
    slug: config.slug,
    module: config.module,
    category: config.category,
    version: config.version,
    reference: config.reference,
    lifeStages: config.lifeStages,
    calculate(inputs: TInputs) {
      const values = config.formula(inputs);
      assertFiniteValues(values);
      const classification = config.classifier ? config.classifier(values, inputs) : null;

      return { values, classification, formulaVersion: config.version };
    },
  };
}
