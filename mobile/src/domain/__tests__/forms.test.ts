import type { Patient } from '../../data/models';
import { ageInMonthsDecimal, ageParts, formatAge, relativeDay } from '../../lib/format';
import { autofillFromPatient } from '../autofill';
import { maskDate, parseTypedDate } from '../../ui/DateTimeField';
import { classificationTone } from '../catalog';
import { classificationLabel } from '../forms/fieldLabels';
import { parseCalculatorForm } from '../forms/parseForm';
import { schemaToFields } from '../forms/schemaToFields';

const imcFields = schemaToFields({
  weight_kg: ['required', 'numeric', 'min:1', 'max:500'],
  height_m: ['required', 'numeric', 'min:0.3', 'max:2.5'],
});

describe('parseCalculatorForm', () => {
  it('accepts a comma as decimal separator and is complete when required fields are valid', () => {
    const parsed = parseCalculatorForm(imcFields, { weight_kg: '70,5', height_m: '1.75' });

    expect(parsed.inputs).toEqual({ weight_kg: 70.5, height_m: 1.75 });
    expect(parsed.complete).toBe(true);
  });

  it('reports range errors next to the field', () => {
    const parsed = parseCalculatorForm(imcFields, { weight_kg: '700', height_m: '1.75' });

    expect(parsed.errors.weight_kg).toBe('Máximo 500.');
    expect(parsed.complete).toBe(false);
  });

  it('is incomplete while a required field is empty', () => {
    expect(parseCalculatorForm(imcFields, { weight_kg: '70' }).complete).toBe(false);
  });

  it('rejects fractions in integer fields and parses booleans', () => {
    const fields = schemaToFields({ age_years: ['required', 'integer'], flag: ['required', 'boolean'] });
    const parsed = parseCalculatorForm(fields, { age_years: '30.5', flag: 'true' });

    expect(parsed.errors.age_years).toBe('Digite um número inteiro.');
    expect(parsed.inputs.flag).toBe(true);
  });
});

describe('autofillFromPatient', () => {
  const child: Patient = {
    id: 'p1', name: 'Ana', birth_date: '2025-03-01', sex: 'female', phone: null, email: null, cpf: null, notes: null,
    archived: 0, created_at: '', updated_at: '',
  };

  it('fills only the fields the calculator asks for, from the patient record', () => {
    const schema = { age_months: [], sex: [], weight_kg: [], length_cm: [], measurement_position: [] };
    const values = autofillFromPatient(schema, child, { weight_kg: 9.5, height_cm: 75.3 }, new Date('2026-03-01T12:00:00'));

    // 365 dias / 30,4375 = 11,99 meses (a OMS conta 12 meses = 365,25 dias).
    expect(values).toEqual({ age_months: '11.99', sex: 'female', weight_kg: '9.5', length_cm: '75.3', measurement_position: 'deitado' });
  });

  it('converts height to meters for adult formulas and computes BMI when asked', () => {
    const adult = { ...child, birth_date: '1980-01-01' };
    const values = autofillFromPatient({ height_m: [], bmi: [] }, adult, { weight_kg: 70, height_cm: 175 });

    expect(values).toEqual({ height_m: '1.75', bmi: '22.86' });
  });

  it('gives fractional years only to age fields that accept fractions', () => {
    const at = new Date('2026-03-01T12:00:00');
    const baby = { ...child, birth_date: '2025-06-01' };

    expect(autofillFromPatient({ age_years: ['required', 'numeric', 'min:0.5'] }, baby, {}, at)).toEqual({ age_years: '0.75' });
    expect(autofillFromPatient({ age_years: ['required', 'integer'] }, baby, {}, at)).toEqual({ age_years: '0' });
  });
});

describe('classificationLabel', () => {
  it.each([
    ['desnutricao_moderada', 'Desnutrição moderada'],
    ['pre_diabetes', 'Pré-diabetes'],
    ['compativel_com_diabetes', 'Compatível com diabetes'],
    ['g3a_leve_a_moderadamente_diminuida', 'G3a leve a moderadamente diminuída'],
    ['sem_resistencia_insulinica', 'Sem resistência insulínica'],
    ['risco_de_sobrepeso', 'Risco de sobrepeso'],
  ])('%s → %s', (code, label) => {
    expect(classificationLabel(code)).toBe(label);
  });
});

describe('age helpers', () => {
  const at = new Date('2026-09-22T12:00:00');

  it('computes completed years and months', () => {
    expect(ageParts('2024-03-25', at)).toEqual({ years: 2, months: 5, totalMonths: 29 });
    expect(formatAge('2024-03-25', at)).toBe('2 anos e 5 meses');
    expect(formatAge('1990-01-01', at)).toBe('36 anos');
    expect(formatAge('2026-06-10', at)).toBe('3 meses');
  });

  it('computes fractional months the way the WHO does (days / 30.4375)', () => {
    expect(ageInMonthsDecimal('2025-09-22', at)).toBe(11.99);
  });

  it('labels today and tomorrow', () => {
    expect(relativeDay('2026-09-22T15:00:00', at)).toBe('Hoje');
    expect(relativeDay('2026-09-23T09:00:00', at)).toBe('Amanhã');
  });
});

describe('typed dates', () => {
  it('masks digits into dd/mm/aaaa while typing', () => {
    expect(maskDate('1504')).toBe('15/04');
    expect(maskDate('15041988')).toBe('15/04/1988');
    expect(maskDate('15/04/1988xx')).toBe('15/04/1988');
  });

  it('rejects impossible dates', () => {
    expect(parseTypedDate('15/04/1988')?.getMonth()).toBe(3);
    expect(parseTypedDate('31/02/2020')).toBeNull();
    expect(parseTypedDate('15/04')).toBeNull();
  });
});

describe('classificationTone', () => {
  it.each([
    ['eutrofia', 'success'],
    ['risco_de_sobrepeso', 'warning'],
    ['obesidade_grave', 'danger'],
    ['muito_baixo_peso_para_idade', 'danger'],
    ['baixo_peso_para_idade', 'warning'],
    ['sem_risco_atual', 'success'],
    ['pre_diabetes', 'warning'],
    ['compativel_com_diabetes', 'danger'],
    ['anemia_grave', 'danger'],
    ['sem_anemia', 'success'],
    ['g2_levemente_diminuida', 'warning'],
    ['g5_falencia_renal', 'danger'],
  ])('%s → %s', (code, tone) => {
    expect(classificationTone(code)).toBe(tone);
  });
});
