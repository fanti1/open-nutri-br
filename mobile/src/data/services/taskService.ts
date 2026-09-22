import type { SqlDatabase } from '../db/types';
import type { Task } from '../models';
import { tasksRepository, type TaskInput } from '../repositories/tasks';
import type { ReminderScheduler } from './reminders';

/** Caso de uso "tarefa com lembrete": mantém a notificação coerente com o estado da tarefa. */
export function taskService(db: SqlDatabase, reminders: ReminderScheduler) {
  const repository = tasksRepository(db);

  async function syncReminder(task: Task): Promise<void> {
    if (task.notification_id) await reminders.cancel(task.notification_id);

    const notificationId =
      !task.done && task.remind_at ? await reminders.schedule(new Date(task.remind_at), 'Lembrete de tarefa', task.title) : null;

    await repository.setNotificationId(task.id, notificationId);
  }

  return {
    async create(input: TaskInput): Promise<string> {
      const id = await repository.create(input);
      await syncReminder((await repository.get(id))!);
      return id;
    },

    async update(id: string, input: TaskInput): Promise<void> {
      await repository.update(id, input);
      await syncReminder((await repository.get(id))!);
    },

    async setDone(id: string, done: boolean): Promise<void> {
      await repository.setDone(id, done);
      await syncReminder((await repository.get(id))!);
    },

    async remove(id: string): Promise<void> {
      const task = await repository.get(id);
      if (task?.notification_id) await reminders.cancel(task.notification_id);
      await repository.remove(id);
    },

    async rescheduleAll(): Promise<void> {
      for (const task of await repository.list('pendentes')) {
        await syncReminder({ ...task, notification_id: null });
      }
    },
  };
}
