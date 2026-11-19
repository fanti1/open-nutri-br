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

/**
 * Os campos isolados são válidos, mas a combinação não permite calcular (ex.:
 * nenhum exame informado num cálculo em que todos são opcionais). A mensagem é
 * mostrada ao usuário.
 */
export class IncompleteInputsError extends Error {}

/**
 * A fórmula produziu algo que não é um número finito (ex.: divisão por zero
 * com uma combinação de valores que a validação por campo não barra). Nunca
 * mostrar nem salvar um resultado assim — a mensagem é exibida no lugar.
 */
export class InvalidResultError extends IncompleteInputsError {
  constructor() {
    super('Não foi possível calcular com esses valores. Confira os dados digitados.');
  }
}

export interface Calculator<TInputs = Record<string, unknown>> {
  slug: string;
  module: string;
  category: string;
  version: string;
  reference: CalculatorReference;
  lifeStages: LifeStage[];
  calculate(inputs: TInputs): CalculationOutcome;
}
