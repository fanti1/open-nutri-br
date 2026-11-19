export type FieldType = 'number' | 'select' | 'boolean' | 'text';

export interface FieldDescriptor {
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  integer?: boolean;
  /**
   * O valor vai para a fórmula como número — inclusive numa lista de opções
   * como `integer|in:0,2` (MNA-SF), que sem isso chegaria como texto e seria
   * concatenado ("0" + "2" = "02") em vez de somado.
   */
  numeric?: boolean;
  /** `required_if:sex,male` — o campo só se aplica (e só aparece) quando outro campo tem esse valor. */
  requiredIf?: { field: string; value: string };
}

/**
 * Regras do Laravel que o formulário do app sabe aplicar. `required_without_all`
 * não vira campo: a própria calculadora recusa a combinação vazia
 * (IncompleteInputsError). Uma regra nova no backend que não esteja aqui faz o
 * teste do catálogo falhar, em vez de o app ignorá-la em silêncio.
 */
const KNOWN_RULE = /^(required|nullable|numeric|integer|boolean|(in|min|max|between|required_if|required_without_all):.+)$/;

export function isKnownRule(rule: string): boolean {
  return KNOWN_RULE.test(rule);
}

/** Campo condicional cuja condição não vale: não aparece, não é validado nem enviado. */
export function isFieldActive(field: FieldDescriptor, values: Record<string, unknown>): boolean {
  if (!field.requiredIf) return true;
  const current = values[field.requiredIf.field];
  return current !== undefined && String(current) === field.requiredIf.value;
}

function argumentOf(rules: string[], name: string): string | undefined {
  return rules.find((rule) => rule.startsWith(`${name}:`))?.slice(name.length + 1);
}

/**
 * Turns a calculator's Laravel-style validation rules (as returned by
 * CalculatorInterface::inputsSchema() and embedded in the catalog) into a
 * small descriptor the form renderer can build inputs from — the app never
 * hardcodes a field list per calculator, so a new calculator shows up
 * automatically, with the same ranges the backend validates.
 */
export function schemaToFields(schema: Record<string, unknown>): FieldDescriptor[] {
  return Object.entries(schema).map(([name, rawRules]) => {
    const rules = (Array.isArray(rawRules) ? rawRules : []).filter(
      (rule): rule is string => typeof rule === 'string',
    );

    const options = argumentOf(rules, 'in')?.split(',');
    const between = argumentOf(rules, 'between')?.split(',').map(Number);
    const min = argumentOf(rules, 'min');
    const max = argumentOf(rules, 'max');
    const requiredIf = argumentOf(rules, 'required_if')?.split(',');
    const numeric = rules.includes('numeric') || rules.includes('integer');

    const type: FieldType = options ? 'select' : rules.includes('boolean') ? 'boolean' : numeric ? 'number' : 'text';

    return {
      name,
      type,
      required: rules.includes('required'),
      options,
      // `between:a,b` é o mesmo que `min:a` + `max:b` (ex.: escores do NRS-2002, 0 a 3).
      min: min !== undefined ? Number(min) : between?.[0],
      max: max !== undefined ? Number(max) : between?.[1],
      integer: rules.includes('integer'),
      numeric,
      requiredIf: requiredIf ? { field: requiredIf[0], value: requiredIf[1] } : undefined,
    };
  });
}
