import { subscribeToChanges, type Table } from '../changes';
import { migrate, SCHEMA_VERSION } from '../db/migrations';
import { createTestDatabase } from '../db/testing/sqlJsDatabase';
import type { SqlDatabase } from '../db/types';
import { attachmentsRepository, AttachmentTooLargeError, MAX_ATTACHMENT_BYTES } from '../repositories/attachments';
import { calculationsRepository } from '../repositories/calculations';
import { consultationsRepository } from '../repositories/consultations';
import { patientsRepository } from '../repositories/patients';
import { settingsRepository } from '../repositories/settings';
import { tasksRepository } from '../repositories/tasks';
import { agendaService } from '../services/agendaService';
import { backupService, InvalidBackupError } from '../services/backupService';
import type { ReminderScheduler } from '../services/reminders';
import { taskService } from '../services/taskService';

async function freshDb(): Promise<SqlDatabase> {
  const db = await createTestDatabase();
  await migrate(db);
  return db;
}

function fakeScheduler() {
  const scheduled = new Map<string, { at: Date; title: string; body: string }>();
  let counter = 0;
  const scheduler: ReminderScheduler = {
    async schedule(at, title, body) {
      const id = `n${++counter}`;
      scheduled.set(id, { at, title, body });
      return id;
    },
    async cancel(id) {
      scheduled.delete(id);
    },
  };
  return { scheduler, scheduled };
}

const maria = { name: 'Maria Silva', birth_date: '1985-03-10', sex: 'female' as const };

describe('migrations', () => {
  it('creates the schema and records the version', async () => {
    const db = await freshDb();
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    expect(row?.user_version).toBe(SCHEMA_VERSION);
  });

  it('is idempotent', async () => {
    const db = await freshDb();
    await expect(migrate(db)).resolves.toBeUndefined();
  });
});

describe('patients', () => {
  it('creates, searches, updates and lists patients', async () => {
    const db = await freshDb();
    const repo = patientsRepository(db);

    const id = await repo.create(maria);
    await repo.create({ name: 'João Souza', birth_date: '2018-01-01', sex: 'male' });

    expect((await repo.list('mar')).map((p) => p.name)).toEqual(['Maria Silva']);
    expect(await repo.count()).toBe(2);

    await repo.update(id, { ...maria, name: 'Maria S. Oliveira' });
    expect((await repo.get(id))?.name).toBe('Maria S. Oliveira');
  });

  it('removing a patient removes their whole record (consultations, calculations, attachments)', async () => {
    const db = await freshDb();
    const id = await patientsRepository(db).create(maria);
    await consultationsRepository(db).create({ patient_id: id, occurred_at: '2026-01-10T10:00:00.000Z', kind: 'consulta', weight_kg: 70 });
    await calculationsRepository(db).create({
      patient_id: id, calculator_slug: 'imc', calculator_name: 'IMC', inputs: {}, values: { value: 22 }, classification: 'eutrofia', formula_version: 'v1',
    });

    await patientsRepository(db).remove(id);

    expect(await consultationsRepository(db).listByPatient(id)).toEqual([]);
    expect(await calculationsRepository(db).listByPatient(id)).toEqual([]);
  });

  it('notifies subscribers about which tables changed', async () => {
    const db = await freshDb();
    const seen: Table[][] = [];
    const unsubscribe = subscribeToChanges((changed) => seen.push([...changed]));

    await patientsRepository(db).create(maria);
    unsubscribe();

    expect(seen).toEqual([['patients']]);
  });
});

describe('consultations', () => {
  it('combines the latest value of each measurement across consultations (calculator auto-fill)', async () => {
    const db = await freshDb();
    const patientId = await patientsRepository(db).create(maria);
    const repo = consultationsRepository(db);

    await repo.create({ patient_id: patientId, occurred_at: '2026-01-10T10:00:00.000Z', kind: 'consulta', weight_kg: 72, height_cm: 165 });
    await repo.create({ patient_id: patientId, occurred_at: '2026-02-10T10:00:00.000Z', kind: 'retorno', weight_kg: 70 });

    expect(await repo.latestMeasurements(patientId)).toEqual({ weight_kg: 70, height_cm: 165 });
    expect((await repo.measurementSeries(patientId, 'weight_kg')).map((p) => p.value)).toEqual([72, 70]);
  });
});

describe('calculations', () => {
  it('stores results and ranks the most used calculators', async () => {
    const db = await freshDb();
    const repo = calculationsRepository(db);
    const base = { inputs: { weight_kg: 70 }, values: { value: 1 }, classification: null, formula_version: 'v1' };

    await repo.create({ ...base, calculator_slug: 'imc', calculator_name: 'IMC' });
    await repo.create({ ...base, calculator_slug: 'imc', calculator_name: 'IMC' });
    await repo.create({ ...base, calculator_slug: 'glim', calculator_name: 'GLIM' });

    expect(await repo.mostUsedSlugs()).toEqual(['imc', 'glim']);
    expect((await repo.recent(1))[0].inputs).toEqual({ weight_kg: 70 });
  });
});

describe('attachments', () => {
  it('rejects files over the size limit', async () => {
    const db = await freshDb();
    const patientId = await patientsRepository(db).create(maria);

    await expect(
      attachmentsRepository(db).create({ patient_id: patientId, name: 'x.pdf', mime_type: 'application/pdf', size_bytes: MAX_ATTACHMENT_BYTES + 1, content_base64: '' }),
    ).rejects.toBeInstanceOf(AttachmentTooLargeError);
  });
});

describe('settings and favorites', () => {
  it('returns defaults, persists values and toggles favorites', async () => {
    const db = await freshDb();
    const repo = settingsRepository(db);

    expect((await repo.all()).onboarding_done).toBe(false);
    await repo.set('onboarding_done', true);
    expect((await repo.all()).onboarding_done).toBe(true);

    expect(await repo.toggleFavorite('imc')).toBe(true);
    expect(await repo.favoriteSlugs()).toEqual(['imc']);
    expect(await repo.toggleFavorite('imc')).toBe(false);
    expect(await repo.favoriteSlugs()).toEqual([]);
  });

  it('remembers the profile chosen for each calculator separately', async () => {
    const db = await freshDb();
    const repo = settingsRepository(db);

    expect((await repo.all()).calculator_profiles).toEqual({});

    await repo.setCalculatorProfile('harris-benedict', { stage: 'adulto', sex: 'female' });
    await repo.setCalculatorProfile('mna-sf', { stage: 'idoso', sex: 'male' });
    await repo.setCalculatorProfile('harris-benedict', { stage: 'idoso', sex: 'female' });

    expect((await repo.all()).calculator_profiles).toEqual({
      'harris-benedict': { stage: 'idoso', sex: 'female' },
      'mna-sf': { stage: 'idoso', sex: 'male' },
    });
  });
});

describe('agenda service', () => {
  const future = new Date(Date.now() + 3 * 24 * 3600_000);

  it('schedules the reminder N minutes before the appointment', async () => {
    const db = await freshDb();
    const { scheduler, scheduled } = fakeScheduler();

    await agendaService(db, scheduler).create({ title: 'Retorno Maria', starts_at: future.toISOString(), duration_minutes: 60, reminder_minutes: 30 });

    const [reminder] = [...scheduled.values()];
    expect(reminder.at.getTime()).toBe(future.getTime() - 30 * 60_000);
    expect(reminder.body).toBe('Retorno Maria');
  });

  it('reschedules on edit and cancels when done or removed', async () => {
    const db = await freshDb();
    const { scheduler, scheduled } = fakeScheduler();
    const agenda = agendaService(db, scheduler);

    const id = await agenda.create({ title: 'A', starts_at: future.toISOString(), duration_minutes: 60, reminder_minutes: 30 });
    await agenda.update(id, { title: 'A', starts_at: future.toISOString(), duration_minutes: 60, reminder_minutes: 60 });
    expect(scheduled.size).toBe(1);
    expect([...scheduled.values()][0].at.getTime()).toBe(future.getTime() - 60 * 60_000);

    await agenda.setStatus(id, 'realizado');
    expect(scheduled.size).toBe(0);

    const other = await agenda.create({ title: 'B', starts_at: future.toISOString(), duration_minutes: 30, reminder_minutes: 15 });
    await agenda.remove(other);
    expect(scheduled.size).toBe(0);
  });

  it('does not schedule anything without a reminder', async () => {
    const db = await freshDb();
    const { scheduler, scheduled } = fakeScheduler();

    await agendaService(db, scheduler).create({ title: 'Sem lembrete', starts_at: future.toISOString(), duration_minutes: 60 });

    expect(scheduled.size).toBe(0);
  });
});

describe('task service', () => {
  it('schedules a reminder and cancels it when the task is completed', async () => {
    const db = await freshDb();
    const { scheduler, scheduled } = fakeScheduler();
    const tasks = taskService(db, scheduler);
    const remindAt = new Date(Date.now() + 3600_000).toISOString();

    const id = await tasks.create({ title: 'Enviar plano alimentar', remind_at: remindAt });
    expect(scheduled.size).toBe(1);

    await tasks.setDone(id, true);
    expect(scheduled.size).toBe(0);
    expect(await tasksRepository(db).countOpen()).toBe(0);
  });
});

describe('backup', () => {
  it('round-trips every table into a fresh device and drops notification ids', async () => {
    const source = await freshDb();
    const { scheduler } = fakeScheduler();
    const patientId = await patientsRepository(source).create(maria);
    await consultationsRepository(source).create({ patient_id: patientId, occurred_at: '2026-01-10T10:00:00.000Z', kind: 'consulta', weight_kg: 70 });
    await attachmentsRepository(source).create({ patient_id: patientId, name: 'exame.pdf', mime_type: 'application/pdf', size_bytes: 3, content_base64: 'YWJj' });
    await taskService(source, scheduler).create({ title: 'Ligar', remind_at: new Date(Date.now() + 3600_000).toISOString() });
    await settingsRepository(source).toggleFavorite('imc');

    const file = await backupService(source).exportData();

    const target = await freshDb();
    const backup = backupService(target);
    await backup.restore(backup.parse(JSON.stringify(file)));

    expect((await patientsRepository(target).list()).map((p) => p.name)).toEqual(['Maria Silva']);
    expect(await consultationsRepository(target).latestMeasurements(patientId)).toEqual({ weight_kg: 70 });
    expect((await attachmentsRepository(target).content((await attachmentsRepository(target).listByPatient(patientId))[0].id))?.content_base64).toBe('YWJj');
    expect((await tasksRepository(target).list())[0].notification_id).toBeNull();
    expect(await settingsRepository(target).favoriteSlugs()).toEqual(['imc']);
  });

  it('restoring replaces existing data instead of merging', async () => {
    const empty = await backupService(await freshDb()).exportData();
    const db = await freshDb();
    await patientsRepository(db).create(maria);

    await backupService(db).restore(empty);

    expect(await patientsRepository(db).count()).toBe(0);
  });

  it('rejects files that are not OpenNutri backups or come from a newer app version', async () => {
    const backup = backupService(await freshDb());

    expect(() => backup.parse('not json')).toThrow(InvalidBackupError);
    expect(() => backup.parse(JSON.stringify({ format: 'other', data: {} }))).toThrow(InvalidBackupError);
    expect(() => backup.parse(JSON.stringify({ format: 'opennutri-br-backup', schema_version: 999, data: {} }))).toThrow(/versão mais nova/);
  });
});
