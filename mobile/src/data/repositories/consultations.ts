import { notifyChange } from '../changes';
import type { SqlDatabase } from '../db/types';
import { newId, nowIso } from '../ids';
import type { Consultation, ConsultationKind, MeasurementField } from '../models';

export interface ConsultationInput {
  patient_id: string;
  occurred_at: string;
  kind: ConsultationKind;
  complaint?: string | null;
  notes?: string | null;
  plan?: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  waist_cm?: number | null;
  hip_cm?: number | null;
  head_circumference_cm?: number | null;
}

export const MEASUREMENT_FIELDS: MeasurementField[] = ['weight_kg', 'height_cm', 'waist_cm', 'hip_cm', 'head_circumference_cm'];

export type LatestMeasurements = Partial<Record<MeasurementField, number>>;

/** Atendimentos (consultas) de um paciente, com as medidas antropométricas daquele dia. */
export function consultationsRepository(db: SqlDatabase) {
  return {
    listByPatient(patientId: string): Promise<Consultation[]> {
      return db.getAllAsync<Consultation>(
        'SELECT * FROM consultations WHERE patient_id = ? ORDER BY occurred_at DESC',
        [patientId],
      );
    },

    get(id: string): Promise<Consultation | null> {
      return db.getFirstAsync<Consultation>('SELECT * FROM consultations WHERE id = ?', [id]);
    },

    /**
     * Medida mais recente de cada campo (podem vir de atendimentos diferentes)
     * — alimenta o auto-preenchimento das calculadoras.
     */
    async latestMeasurements(patientId: string): Promise<LatestMeasurements> {
      // Uma consulta só (uma subconsulta por medida) em vez de uma ida ao banco por campo.
      const row = await db.getFirstAsync<Record<MeasurementField, number | null>>(
        `SELECT ${MEASUREMENT_FIELDS.map(
          (field) => `(SELECT ${field} FROM consultations WHERE patient_id = ? AND ${field} IS NOT NULL ORDER BY occurred_at DESC LIMIT 1) AS ${field}`,
        ).join(', ')}`,
        MEASUREMENT_FIELDS.map(() => patientId),
      );

      const result: LatestMeasurements = {};
      for (const field of MEASUREMENT_FIELDS) {
        const value = row?.[field];
        if (value != null) result[field] = value;
      }
      return result;
    },

    /** Série temporal de uma medida, da mais antiga para a mais recente (gráfico de evolução). */
    measurementSeries(patientId: string, field: MeasurementField): Promise<{ occurred_at: string; value: number }[]> {
      return db.getAllAsync(
        `SELECT occurred_at, ${field} AS value FROM consultations
         WHERE patient_id = ? AND ${field} IS NOT NULL ORDER BY occurred_at ASC`,
        [patientId],
      );
    },

    async create(input: ConsultationInput): Promise<string> {
      const id = newId();
      const now = nowIso();
      await db.runAsync(
        `INSERT INTO consultations (id, patient_id, occurred_at, kind, complaint, notes, plan,
           weight_kg, height_cm, waist_cm, hip_cm, head_circumference_cm, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, input.patient_id, input.occurred_at, input.kind, input.complaint ?? null, input.notes ?? null, input.plan ?? null,
          input.weight_kg ?? null, input.height_cm ?? null, input.waist_cm ?? null, input.hip_cm ?? null, input.head_circumference_cm ?? null,
          now, now,
        ],
      );
      notifyChange('consultations', 'patients');
      return id;
    },

    async update(id: string, input: ConsultationInput): Promise<void> {
      await db.runAsync(
        `UPDATE consultations SET occurred_at = ?, kind = ?, complaint = ?, notes = ?, plan = ?,
           weight_kg = ?, height_cm = ?, waist_cm = ?, hip_cm = ?, head_circumference_cm = ?, updated_at = ?
         WHERE id = ?`,
        [
          input.occurred_at, input.kind, input.complaint ?? null, input.notes ?? null, input.plan ?? null,
          input.weight_kg ?? null, input.height_cm ?? null, input.waist_cm ?? null, input.hip_cm ?? null, input.head_circumference_cm ?? null,
          nowIso(), id,
        ],
      );
      notifyChange('consultations', 'patients');
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM consultations WHERE id = ?', [id]);
      notifyChange('consultations', 'calculations', 'patients');
    },
  };
}
