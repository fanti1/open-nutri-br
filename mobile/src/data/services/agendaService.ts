import type { SqlDatabase } from '../db/types';
import type { Appointment, AppointmentStatus } from '../models';
import { appointmentsRepository, type AppointmentInput } from '../repositories/appointments';
import type { ReminderScheduler } from './reminders';

const TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

/**
 * Caso de uso "compromisso com lembrete": grava na agenda e mantém a
 * notificação sincronizada (agenda, reagenda ao editar, cancela ao excluir/concluir).
 */
export function agendaService(db: SqlDatabase, reminders: ReminderScheduler) {
  const repository = appointmentsRepository(db);

  async function syncReminder(appointment: Appointment): Promise<void> {
    if (appointment.notification_id) {
      await reminders.cancel(appointment.notification_id);
    }

    let notificationId: string | null = null;

    if (appointment.status === 'agendado' && appointment.reminder_minutes != null) {
      const startsAt = new Date(appointment.starts_at);
      const remindAt = new Date(startsAt.getTime() - appointment.reminder_minutes * 60_000);
      notificationId = await reminders.schedule(
        remindAt,
        `Atendimento às ${TIME_FORMAT.format(startsAt)}`,
        appointment.title,
      );
    }

    await repository.setNotificationId(appointment.id, notificationId);
  }

  return {
    async create(input: AppointmentInput): Promise<string> {
      const id = await repository.create(input);
      await syncReminder((await repository.get(id))!);
      return id;
    },

    async update(id: string, input: AppointmentInput): Promise<void> {
      await repository.update(id, input);
      await syncReminder((await repository.get(id))!);
    },

    async setStatus(id: string, status: AppointmentStatus): Promise<void> {
      await repository.setStatus(id, status);
      await syncReminder((await repository.get(id))!);
    },

    async remove(id: string): Promise<void> {
      const appointment = await repository.get(id);
      if (appointment?.notification_id) await reminders.cancel(appointment.notification_id);
      await repository.remove(id);
    },

    /** Recria os lembretes de compromissos futuros (ex.: após restaurar um backup em outro aparelho). */
    async rescheduleAll(): Promise<void> {
      for (const appointment of await repository.futureScheduled(new Date().toISOString())) {
        await syncReminder({ ...appointment, notification_id: null });
      }
    },
  };
}
