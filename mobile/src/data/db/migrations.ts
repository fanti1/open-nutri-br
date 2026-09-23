import type { SqlDatabase } from './types';

/**
 * Migrações do banco local, em ordem. A versão aplicada fica em
 * PRAGMA user_version; nunca editar uma migração já publicada — criar a próxima.
 */
export const MIGRATIONS: string[] = [
  `
  CREATE TABLE patients (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
    phone TEXT,
    email TEXT,
    cpf TEXT,
    notes TEXT,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE consultations (
    id TEXT PRIMARY KEY NOT NULL,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    occurred_at TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'consulta' CHECK (kind IN ('consulta', 'retorno', 'avaliacao')),
    complaint TEXT,
    notes TEXT,
    plan TEXT,
    weight_kg REAL,
    height_cm REAL,
    waist_cm REAL,
    hip_cm REAL,
    head_circumference_cm REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX consultations_patient ON consultations (patient_id, occurred_at);

  CREATE TABLE calculations (
    id TEXT PRIMARY KEY NOT NULL,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    consultation_id TEXT REFERENCES consultations(id) ON DELETE SET NULL,
    calculator_slug TEXT NOT NULL,
    calculator_name TEXT NOT NULL,
    inputs TEXT NOT NULL,
    result_values TEXT NOT NULL,
    classification TEXT,
    formula_version TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX calculations_patient ON calculations (patient_id, calculator_slug, created_at);

  CREATE TABLE attachments (
    id TEXT PRIMARY KEY NOT NULL,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mime_type TEXT,
    size_bytes INTEGER NOT NULL,
    content_base64 TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX attachments_patient ON attachments (patient_id);

  CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    due_at TEXT,
    remind_at TEXT,
    notification_id TEXT,
    patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
    done INTEGER NOT NULL DEFAULT 0,
    done_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX tasks_open ON tasks (done, due_at);

  CREATE TABLE appointments (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
    starts_at TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    location TEXT,
    notes TEXT,
    reminder_minutes INTEGER,
    notification_id TEXT,
    status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'realizado', 'cancelado', 'faltou')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX appointments_start ON appointments (starts_at);

  CREATE TABLE favorites (
    calculator_slug TEXT PRIMARY KEY NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
  // 2 — Planos alimentares e recordatórios 24 h (alimentos da TACO embarcada).
  `
  CREATE TABLE meal_plans (
    id TEXT PRIMARY KEY NOT NULL,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    kind TEXT NOT NULL DEFAULT 'plano' CHECK (kind IN ('plano', 'recordatorio')),
    title TEXT NOT NULL,
    target_kcal REAL,
    reference_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX idx_meal_plans_patient ON meal_plans(patient_id, updated_at);

  CREATE TABLE meal_plan_items (
    id TEXT PRIMARY KEY NOT NULL,
    plan_id TEXT NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    meal TEXT NOT NULL,
    food_id INTEGER NOT NULL,
    food_name TEXT NOT NULL,
    quantity_g REAL NOT NULL CHECK (quantity_g > 0),
    household_measure TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX idx_meal_plan_items_plan ON meal_plan_items(plan_id, meal, position);
  `,
];

export const SCHEMA_VERSION = MIGRATIONS.length;

export async function migrate(db: SqlDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const current = row?.user_version ?? 0;

  for (let version = current; version < MIGRATIONS.length; version++) {
    await db.execAsync(`BEGIN; ${MIGRATIONS[version]} PRAGMA user_version = ${version + 1}; COMMIT;`);
  }
}
