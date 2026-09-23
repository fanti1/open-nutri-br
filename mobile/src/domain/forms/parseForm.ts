import { fieldLabel } from './fieldLabels';
import { isFieldActive, type FieldDescriptor } from './schemaToFields';

export interface ParsedForm {
  inputs: Record<string, unknown>;
  errors: Record<string, string>;
  /** Todos os campos obrigatórios preenchidos e válidos. */
  complete: boolean;
}

/**
 * Converte o texto digitado em valores tipados e valida contra as mesmas
 * regras de faixa do backend — permite mostrar o erro ao lado do campo e
 * calcular em tempo real assim que tudo estiver válido.
 */
export function parseCalculatorForm(fields: FieldDescriptor[], raw: Record<string, string>): ParsedForm {
  const inputs: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (!isFieldActive(field, raw)) continue;
    const text = (raw[field.name] ?? '').trim();
    if (text === '') continue;

    if (field.type === 'number') {
      const value = Number(text.replace(',', '.'));

      if (!Number.isFinite(value)) {
        errors[field.name] = 'Digite um número.';
        continue;
      }
      if (field.integer && !Number.isInteger(value)) {
        errors[field.name] = 'Digite um número inteiro.';
        continue;
      }
      if (field.min !== undefined && value < field.min) {
        errors[field.name] = `Mínimo ${String(field.min).replace('.', ',')}.`;
        continue;
      }
      if (field.max !== undefined && value > field.max) {
        errors[field.name] = `Máximo ${String(field.max).replace('.', ',')}.`;
        continue;
      }

      inputs[field.name] = value;
    } else if (field.type === 'boolean') {
      inputs[field.name] = text === 'true';
    } else {
      inputs[field.name] = text;
    }
  }

  const complete = Object.keys(errors).length === 0 && fields.every((field) => !isRequired(field, raw) || inputs[field.name] !== undefined);

  return { inputs, errors, complete };
}

function isRequired(field: FieldDescriptor, values: Record<string, unknown>): boolean {
  return field.required || (field.requiredIf !== undefined && isFieldActive(field, values));
}

export function missingFieldsMessage(fields: FieldDescriptor[], inputs: Record<string, unknown>): string | null {
  const missing = fields.filter((field) => isRequired(field, inputs) && inputs[field.name] === undefined).map((field) => fieldLabel(field.name));
  return missing.length ? `Falta preencher: ${missing.join(', ')}.` : null;
}
