import { notifyChange } from '../changes';
import type { SqlDatabase } from '../db/types';
import { newId, nowIso } from '../ids';
import type { Patient, Sex } from '../models';

export interface PatientInput {
  name: string;
  birth_date: string;
  sex: Sex;
  phone?: string | null;
  email?: string | null;
  cpf?: string | null;
  notes?: string | null;
}

/** Fichas de pacientes (dados cadastrais). Tudo local, no aparelho. */
export function patientsRepository(db: SqlDatabase) {
  return {
    list(search = ''): Promise<Patient[]> {
      return db.getAllAsync<Patient>(
        `SELECT * FROM patients WHERE archived = 0 AND name LIKE ? ORDER BY name COLLATE NOCASE`,
        [`%${search.trim()}%`],
      );
    },

    recent(limit = 5): Promise<Patient[]> {
      return db.getAllAsync<Patient>(
        `SELECT p.* FROM patients p
         LEFT JOIN consultations c ON c.patient_id = p.id
         WHERE p.archived = 0
         GROUP BY p.id
         ORDER BY MAX(COALESCE(c.occurred_at, p.updated_at)) DESC
         LIMIT ?`,
        [limit],
      );
    },

    count(): Promise<number> {
      return db
        .getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM patients WHERE archived = 0')
        .then((row) => row?.total ?? 0);
    },

    get(id: string): Promise<Patient | null> {
      return db.getFirstAsync<Patient>('SELECT * FROM patients WHERE id = ?', [id]);
    },

    async create(input: PatientInput): Promise<string> {
      const id = newId();
      const now = nowIso();
      await db.runAsync(
        `INSERT INTO patients (id, name, birth_date, sex, phone, email, cpf, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, input.name.trim(), input.birth_date, input.sex, input.phone ?? null, input.email ?? null, input.cpf ?? null, input.notes ?? null, now, now],
      );
      notifyChange('patients');
      return id;
    },

    async update(id: string, input: PatientInput): Promise<void> {
      await db.runAsync(
        `UPDATE patients SET name = ?, birth_date = ?, sex = ?, phone = ?, email = ?, cpf = ?, notes = ?, updated_at = ?
         WHERE id = ?`,
        [input.name.trim(), input.birth_date, input.sex, input.phone ?? null, input.email ?? null, input.cpf ?? null, input.notes ?? null, nowIso(), id],
      );
      notifyChange('patients');
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM patients WHERE id = ?', [id]);
      notifyChange('patients', 'consultations', 'calculations', 'attachments', 'tasks', 'appointments');
    },
  };
}
