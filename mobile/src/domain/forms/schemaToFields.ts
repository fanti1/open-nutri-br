export type FieldType = 'number' | 'select' | 'boolean' | 'text';

export interface FieldDescriptor {
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  integer?: boolean;
  /** `required_if:sex,male` — o campo só se aplica (e só aparece) quando outro campo tem esse valor. */
  requiredIf?: { field: string; value: string };
}

/** Campo condicional cuja condição não vale: não aparece, não é validado nem enviado. */
export function isFieldActive(field: FieldDescriptor, values: Record<string, unknown>): boolean {
  if (!field.requiredIf) return true;
  const current = values[field.requiredIf.field];
  return current !== undefined && String(current) === field.requiredIf.value;
}

/**
 * Turns a calculator's Laravel-style validation rules (as returned by
 * CalculatorInterface::inputsSchema() and served via GET /calculators/{slug})
 * into a small descriptor the form renderer can build inputs from — the app
 * never hardcodes a field list per calculator, so a new backend calculator
 * shows up automatically.
 */
export function schemaToFields(schema: Record<string, unknown>): FieldDescriptor[] {
  return Object.entries(schema).map(([name, rawRules]) => {
    const rules = (Array.isArray(rawRules) ? rawRules : []).filter(
      (rule): rule is string => typeof rule === 'string',
    );

    const inRule = rules.find((rule) => rule.startsWith('in:'));
    const minRule = rules.find((rule) => rule.startsWith('min:'));
    const maxRule = rules.find((rule) => rule.startsWith('max:'));
    const requiredIfRule = rules.find((rule) => rule.startsWith('required_if:'));
    const [conditionField, conditionValue] = requiredIfRule ? requiredIfRule.slice('required_if:'.length).split(',') : [];

    const type: FieldType = inRule
      ? 'select'
      : rules.includes('boolean')
        ? 'boolean'
        : rules.includes('numeric') || rules.includes('integer')
          ? 'number'
          : 'text';

    return {
      name,
      type,
      required: rules.includes('required'),
      options: inRule ? inRule.slice(3).split(',') : undefined,
      min: minRule ? Number(minRule.slice(4)) : undefined,
      max: maxRule ? Number(maxRule.slice(4)) : undefined,
      integer: rules.includes('integer'),
      requiredIf: requiredIfRule ? { field: conditionField, value: conditionValue } : undefined,
    };
  });
}
