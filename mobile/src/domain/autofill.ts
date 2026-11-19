import type { LatestMeasurements } from '../data/repositories/consultations';
import type { Patient } from '../data/models';
import { ageInMonthsDecimal, ageInYearsDecimal, ageParts } from '../lib/format';
import { roundHalfUp } from './calculators/support/round';

/**
 * Valores iniciais de um formulário de calculadora a partir da ficha do
 * paciente (sexo, idade e últimas medidas registradas nos atendimentos). Só
 * preenche campos que a calculadora realmente pede; o profissional pode alterar tudo.
 */
export function autofillFromPatient(
  schema: Record<string, unknown>,
  patient: Patient,
  measurements: LatestMeasurements,
  at = new Date(),
): Record<string, string> {
  const fields = new Set(Object.keys(schema));
  const values: Record<string, string> = {};
  const set = (field: string, value: number | string | undefined) => {
    if (fields.has(field) && value !== undefined && value !== '') values[field] = String(value);
  };

  const { years } = ageParts(patient.birth_date, at);
  const ageMonths = ageInMonthsDecimal(patient.birth_date, at);

  set('sex', patient.sex);
  // Campos de idade que aceitam fração (ex.: anemia da OMS a partir de 6 meses) recebem anos com decimais.
  set('age_years', acceptsFraction(schema.age_years) ? ageInYearsDecimal(patient.birth_date, at) : years);
  set('age_months', ageMonths);
  set('weight_kg', measurements.weight_kg);
  set('current_weight_kg', measurements.weight_kg);
  set('height_cm', measurements.height_cm);
  set('height_m', measurements.height_cm !== undefined ? roundHalfUp(measurements.height_cm / 100, 3) : undefined);
  set('length_cm', measurements.height_cm);
  set('waist_cm', measurements.waist_cm);
  set('hip_cm', measurements.hip_cm);
  set('head_circumference_cm', measurements.head_circumference_cm);

  if (fields.has('measurement_position')) {
    // A OMS referencia menores de 2 anos deitados (comprimento) e maiores em pé (estatura).
    values.measurement_position = ageMonths < 24 ? 'deitado' : 'em_pe';
  }

  // Mesmo arredondamento da calculadora de IMC: o IMC preenchido é o que ela mostraria.
  if (fields.has('bmi') && measurements.weight_kg && measurements.height_cm) {
    values.bmi = String(roundHalfUp(measurements.weight_kg / (measurements.height_cm / 100) ** 2, 2));
  }

  return values;
}

function acceptsFraction(rules: unknown): boolean {
  return Array.isArray(rules) && rules.includes('numeric') && !rules.includes('integer');
}
