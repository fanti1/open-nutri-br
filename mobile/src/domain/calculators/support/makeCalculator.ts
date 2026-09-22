import type {
  Calculator,
  CalculatorReference,
  Classifier,
  Formula,
  LifeStage,
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

/**
 * Wires a Formula and an optional Classifier together — the TS equivalent of
 * backend AbstractCalculator. Keeping this the only place calculate() is
 * implemented means formula/classifier stay independently unit-testable pure
 * functions, and every calculator's metadata lives in one small config object.
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
      const classification = config.classifier ? config.classifier(values, inputs) : null;

      return { values, classification, formulaVersion: config.version };
    },
  };
}
