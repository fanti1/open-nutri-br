import { schemaToFields } from '../schemaToFields';

describe('schemaToFields', () => {
  it('detects a select field from an in: rule', () => {
    const [field] = schemaToFields({ sex: ['required', 'in:male,female'] });

    expect(field).toMatchObject({ name: 'sex', type: 'select', required: true, options: ['male', 'female'] });
  });

  it('detects a number field and extracts min/max', () => {
    const [field] = schemaToFields({ weight_kg: ['required', 'numeric', 'min:1', 'max:500'] });

    expect(field).toMatchObject({ name: 'weight_kg', type: 'number', min: 1, max: 500, integer: false });
  });

  it('detects an integer field', () => {
    const [field] = schemaToFields({ age_years: ['required', 'integer', 'min:1', 'max:120'] });

    expect(field.integer).toBe(true);
  });

  it('falls back to text for anything else', () => {
    const [field] = schemaToFields({ notes: ['nullable', 'string'] });

    expect(field.type).toBe('text');
    expect(field.required).toBe(false);
  });

  it('detects a boolean field', () => {
    const [field] = schemaToFields({ acute_disease_effect: ['required', 'boolean'] });

    expect(field).toMatchObject({ name: 'acute_disease_effect', type: 'boolean', required: true });
  });
});
