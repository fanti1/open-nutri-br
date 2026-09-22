import { notifyChange } from '../changes';
import type { SqlDatabase } from '../db/types';
import { newId, nowIso } from '../ids';
import type { Appointment, AppointmentStatus } from '../models';

export interface AppointmentInput {
  title: string;
  patient_id?: string | null;
  starts_at: string;
  duration_minutes: number;
  location?: string | null;
  notes?: string | null;
  reminder_minutes?: number | null;
}

export interface AppointmentWithPatient extends Appointment {
  patient_name: string | null;
}

/** Agenda de atendimentos. Lembretes são agendados pelo serviço de agenda, não aqui. */
export function appointmentsRepository(db: SqlDatabase) {
  const withPatient = `SELECT a.*, p.name AS patient_name FROM appointments a LEFT JOIN patients p ON p.id = a.patient_id`;

  return {
    /** Compromissos com início em [from, to). */
    listBetween(from: string, to: string): Promise<AppointmentWithPatient[]> {
      return db.getAllAsync<AppointmentWithPatient>(
        `${withPatient} WHERE a.starts_at >= ? AND a.starts_at < ? ORDER BY a.starts_at ASC`,
        [from, to],
      );
    },

    upcoming(fromIso: string, limit = 5): Promise<AppointmentWithPatient[]> {
      return db.getAllAsync<AppointmentWithPatient>(
        `${withPatient} WHERE a.starts_at >= ? AND a.status = 'agendado' ORDER BY a.starts_at ASC LIMIT ?`,
        [fromIso, limit],
      );
    },

    listByPatient(patientId: string): Promise<AppointmentWithPatient[]> {
      return db.getAllAsync<AppointmentWithPatient>(`${withPatient} WHERE a.patient_id = ? ORDER BY a.starts_at DESC`, [patientId]);
    },

    get(id: string): Promise<AppointmentWithPatient | null> {
      return db.getFirstAsync<AppointmentWithPatient>(`${withPatient} WHERE a.id = ?`, [id]);
    },

    /** Compromissos futuros ainda agendados — usados para reagendar lembretes após restaurar um backup. */
    futureScheduled(fromIso: string): Promise<Appointment[]> {
      return db.getAllAsync<Appointment>(`SELECT * FROM appointments WHERE starts_at >= ? AND status = 'agendado'`, [fromIso]);
    },

    async create(input: AppointmentInput): Promise<string> {
      const id = newId();
      const now = nowIso();
      await db.runAsync(
        `INSERT INTO appointments (id, title, patient_id, starts_at, duration_minutes, location, notes, reminder_minutes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, input.title.trim(), input.patient_id ?? null, input.starts_at, input.duration_minutes,
          input.location ?? null, input.notes ?? null, input.reminder_minutes ?? null, now, now,
        ],
      );
      notifyChange('appointments');
      return id;
    },

    async update(id: string, input: AppointmentInput): Promise<void> {
      await db.runAsync(
        `UPDATE appointments SET title = ?, patient_id = ?, starts_at = ?, duration_minutes = ?, location = ?, notes = ?,
           reminder_minutes = ?, updated_at = ? WHERE id = ?`,
        [
          input.title.trim(), input.patient_id ?? null, input.starts_at, input.duration_minutes,
          input.location ?? null, input.notes ?? null, input.reminder_minutes ?? null, nowIso(), id,
        ],
      );
      notifyChange('appointments');
    },

    async setStatus(id: string, status: AppointmentStatus): Promise<void> {
      await db.runAsync('UPDATE appointments SET status = ?, updated_at = ? WHERE id = ?', [status, nowIso(), id]);
      notifyChange('appointments');
    },

    async setNotificationId(id: string, notificationId: string | null): Promise<void> {
      await db.runAsync('UPDATE appointments SET notification_id = ? WHERE id = ?', [notificationId, id]);
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM appointments WHERE id = ?', [id]);
      notifyChange('appointments');
    },
  };
}
