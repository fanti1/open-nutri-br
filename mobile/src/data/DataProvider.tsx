import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { errorLog } from '../lib/errorLog';
import { openDatabase } from './db/openDatabase';
import type { SqlDatabase } from './db/types';
import { attachmentsRepository } from './repositories/attachments';
import { appointmentsRepository } from './repositories/appointments';
import { calculationsRepository } from './repositories/calculations';
import { consultationsRepository } from './repositories/consultations';
import { mealPlansRepository } from './repositories/mealPlans';
import { patientsRepository } from './repositories/patients';
import { settingsRepository } from './repositories/settings';
import { tasksRepository } from './repositories/tasks';
import { agendaService } from './services/agendaService';
import { backupService } from './services/backupService';
import { configureForegroundNotifications, deviceReminderScheduler } from './services/reminders';
import { taskService } from './services/taskService';
import { favoritesQuery, settingsQuery } from './sharedQuery';

function createAppData(db: SqlDatabase) {
  return {
    db,
    patients: patientsRepository(db),
    consultations: consultationsRepository(db),
    calculations: calculationsRepository(db),
    attachments: attachmentsRepository(db),
    tasks: tasksRepository(db),
    appointments: appointmentsRepository(db),
    mealPlans: mealPlansRepository(db),
    settings: settingsRepository(db),
    agenda: agendaService(db, deviceReminderScheduler),
    taskActions: taskService(db, deviceReminderScheduler),
    backup: backupService(db),
  };
}

export type AppData = ReturnType<typeof createAppData>;

const DataContext = createContext<AppData | null>(null);

export function DataProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    configureForegroundNotifications();
    openDatabase()
      .then(async (db) => {
        const appData = createAppData(db);
        // Preferências já carregadas na primeira tela: o tema escolhido aparece
        // de cara (sem piscar o claro) e nenhuma tela começa em "carregando".
        await Promise.all([settingsQuery.connect(() => appData.settings.all()), favoritesQuery.connect(() => appData.settings.favoriteSlugs())]);
        errorLog.attach((await appData.settings.all()).error_log, (entries) => appData.settings.saveErrorLog(entries));
        setData(appData);
      })
      .catch((e: Error) => {
        errorLog.record(e);
        setError(e);
      });
  }, []);

  if (error) throw error;
  if (!data) return <>{fallback}</>;

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

/** Repositórios e serviços do banco local. */
export function useData(): AppData {
  const data = useContext(DataContext);
  if (!data) throw new Error('useData() fora do DataProvider');
  return data;
}
