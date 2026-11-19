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

    /** Quantos registros a ficha tem em cada aba — contados no banco, sem carregar as listas. */
    async recordCounts(id: string): Promise<{ consultations: number; calculations: number; attachments: number; mealPlans: number }> {
      const row = await db.getFirstAsync<{ consultations: number; calculations: number; attachments: number; mealPlans: number }>(
        `SELECT
           (SELECT COUNT(*) FROM consultations WHERE patient_id = ?) AS consultations,
           (SELECT COUNT(*) FROM calculations WHERE patient_id = ?) AS calculations,
           (SELECT COUNT(*) FROM attachments WHERE patient_id = ?) AS attachments,
           (SELECT COUNT(*) FROM meal_plans WHERE patient_id = ?) AS mealPlans`,
        [id, id, id, id],
      );
      return row ?? { consultations: 0, calculations: 0, attachments: 0, mealPlans: 0 };
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
      // Tudo que sai junto (ON DELETE CASCADE) ou perde o vínculo (SET NULL).
      notifyChange('patients', 'consultations', 'calculations', 'attachments', 'tasks', 'appointments', 'meal_plans', 'meal_plan_items');
    },
  };
}
