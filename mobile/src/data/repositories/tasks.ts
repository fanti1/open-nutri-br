import { notifyChange } from '../changes';
import type { SqlDatabase } from '../db/types';
import { newId, nowIso } from '../ids';
import type { Task } from '../models';

export interface TaskInput {
  title: string;
  notes?: string | null;
  due_at?: string | null;
  remind_at?: string | null;
  patient_id?: string | null;
}

export type TaskFilter = 'pendentes' | 'concluidas' | 'todas';

/** Checklist de tarefas do profissional. Lembretes são agendados pelo serviço de tarefas, não aqui. */
export function tasksRepository(db: SqlDatabase) {
  return {
    list(filter: TaskFilter = 'pendentes'): Promise<Task[]> {
      const where = filter === 'pendentes' ? 'WHERE done = 0' : filter === 'concluidas' ? 'WHERE done = 1' : '';
      // Pendentes: com prazo primeiro (mais próximo), depois sem prazo; concluídas: mais recentes primeiro.
      const order = filter === 'concluidas' ? 'done_at DESC' : 'done ASC, due_at IS NULL, due_at ASC, created_at DESC';
      return db.getAllAsync<Task>(`SELECT * FROM tasks ${where} ORDER BY ${order}`);
    },

    listByPatient(patientId: string): Promise<Task[]> {
      return db.getAllAsync<Task>('SELECT * FROM tasks WHERE patient_id = ? ORDER BY done ASC, due_at IS NULL, due_at ASC', [patientId]);
    },

    get(id: string): Promise<Task | null> {
      return db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
    },

    countOpen(): Promise<number> {
      return db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM tasks WHERE done = 0').then((row) => row?.total ?? 0);
    },

    async create(input: TaskInput): Promise<string> {
      const id = newId();
      const now = nowIso();
      await db.runAsync(
        `INSERT INTO tasks (id, title, notes, due_at, remind_at, patient_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, input.title.trim(), input.notes ?? null, input.due_at ?? null, input.remind_at ?? null, input.patient_id ?? null, now, now],
      );
      notifyChange('tasks');
      return id;
    },

    async update(id: string, input: TaskInput): Promise<void> {
      await db.runAsync(
        `UPDATE tasks SET title = ?, notes = ?, due_at = ?, remind_at = ?, patient_id = ?, updated_at = ? WHERE id = ?`,
        [input.title.trim(), input.notes ?? null, input.due_at ?? null, input.remind_at ?? null, input.patient_id ?? null, nowIso(), id],
      );
      notifyChange('tasks');
    },

    async setDone(id: string, done: boolean): Promise<void> {
      await db.runAsync('UPDATE tasks SET done = ?, done_at = ?, updated_at = ? WHERE id = ?', [
        done ? 1 : 0,
        done ? nowIso() : null,
        nowIso(),
        id,
      ]);
      notifyChange('tasks');
    },

    async setNotificationId(id: string, notificationId: string | null): Promise<void> {
      await db.runAsync('UPDATE tasks SET notification_id = ? WHERE id = ?', [notificationId, id]);
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
      notifyChange('tasks');
    },
  };
}
