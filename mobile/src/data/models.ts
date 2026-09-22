export type Sex = 'male' | 'female';

export interface Patient {
  id: string;
  name: string;
  birth_date: string;
  sex: Sex;
  phone: string | null;
  email: string | null;
  cpf: string | null;
  notes: string | null;
  archived: number;
  created_at: string;
  updated_at: string;
}

export type ConsultationKind = 'consulta' | 'retorno' | 'avaliacao';

export interface Consultation {
  id: string;
  patient_id: string;
  occurred_at: string;
  kind: ConsultationKind;
  complaint: string | null;
  notes: string | null;
  plan: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  head_circumference_cm: number | null;
  created_at: string;
  updated_at: string;
}

export type MeasurementField = 'weight_kg' | 'height_cm' | 'waist_cm' | 'hip_cm' | 'head_circumference_cm';

export interface SavedCalculation {
  id: string;
  patient_id: string | null;
  consultation_id: string | null;
  calculator_slug: string;
  calculator_name: string;
  inputs: Record<string, unknown>;
  values: Record<string, number>;
  classification: string | null;
  formula_version: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  patient_id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  notes: string | null;
  due_at: string | null;
  remind_at: string | null;
  notification_id: string | null;
  patient_id: string | null;
  done: number;
  done_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'agendado' | 'realizado' | 'cancelado' | 'faltou';

export interface Appointment {
  id: string;
  title: string;
  patient_id: string | null;
  starts_at: string;
  duration_minutes: number;
  location: string | null;
  notes: string | null;
  reminder_minutes: number | null;
  notification_id: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  name: string;
  crn_number: string;
  crn_state: string;
  specialty: string;
}
