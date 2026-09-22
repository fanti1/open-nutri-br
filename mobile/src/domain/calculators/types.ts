/**
 * Life stages a calculator's underlying study population validates it for —
 * mirrors backend/app/Domain/Calculators/Support/LifeStage.php exactly, so the
 * app never offers an adult-only formula for a pediatric patient.
 */
export type LifeStage = 'crianca' | 'adulto' | 'idoso';

export interface CalculatorReference {
  method: string;
  citation: string;
}

export interface CalculationOutcome {
  values: Record<string, number>;
  classification: string | null;
  formulaVersion: string;
}

/**
 * A pure mathematical formula: given validated inputs, returns numeric outputs.
 * Mirrors backend FormulaInterface — no UI, no persistence, no interpretation.
 */
export type Formula<TInputs> = (inputs: TInputs) => Record<string, number>;

/**
 * Turns a formula's numeric output into a clinical classification/label.
 * Mirrors backend ClassifierInterface.
 */
export type Classifier<TInputs> = (
  result: Record<string, number>,
  inputs: TInputs,
) => string;

export interface Calculator<TInputs = Record<string, unknown>> {
  slug: string;
  module: string;
  category: string;
  version: string;
  reference: CalculatorReference;
  lifeStages: LifeStage[];
  calculate(inputs: TInputs): CalculationOutcome;
}
