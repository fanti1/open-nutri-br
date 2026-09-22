import type { LatestMeasurements } from '../data/repositories/consultations';
import type { Patient } from '../data/models';
import { ageInMonthsDecimal, ageParts } from '../lib/format';

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
  set('age_years', years);
  set('age_months', ageMonths);
  set('weight_kg', measurements.weight_kg);
  set('current_weight_kg', measurements.weight_kg);
  set('height_cm', measurements.height_cm);
  set('height_m', measurements.height_cm !== undefined ? round(measurements.height_cm / 100, 3) : undefined);
  set('length_cm', measurements.height_cm);
  set('waist_cm', measurements.waist_cm);
  set('hip_cm', measurements.hip_cm);
  set('head_circumference_cm', measurements.head_circumference_cm);

  if (fields.has('measurement_position')) {
    // A OMS referencia menores de 2 anos deitados (comprimento) e maiores em pé (estatura).
    values.measurement_position = ageMonths < 24 ? 'deitado' : 'em_pe';
  }

  if (fields.has('bmi') && measurements.weight_kg && measurements.height_cm) {
    values.bmi = String(round(measurements.weight_kg / (measurements.height_cm / 100) ** 2, 2));
  }

  return values;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
