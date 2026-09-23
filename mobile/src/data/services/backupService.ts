import { notifyChange, type Table } from '../changes';
import { SCHEMA_VERSION } from '../db/migrations';
import type { SqlDatabase, SqlParam } from '../db/types';

export const BACKUP_FORMAT = 'opennutri-br-backup';

/** Ordem de inserção respeita as chaves estrangeiras (pacientes antes de atendimentos etc.). */
const TABLES: Table[] = [
  'patients',
  'consultations',
  'calculations',
  'attachments',
  'tasks',
  'appointments',
  'meal_plans',
  'meal_plan_items',
  'favorites',
  'settings',
];

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  schema_version: number;
  exported_at: string;
  data: Partial<Record<Table, Array<Record<string, SqlParam>>>>;
}

export class InvalidBackupError extends Error {}

/**
 * Configurações que pertencem ao aparelho, não aos dados: o PIN do bloqueio não
 * vai no backup (quem esqueceu o PIN reinstala e restaura sem ficar trancado).
 */
const DEVICE_ONLY_SETTINGS = ['app_lock'];

/** Dias sem backup a partir dos quais o app passa a lembrar. */
export const BACKUP_REMINDER_DAYS = 7;

/** Nunca fez backup, ou o último tem mais de BACKUP_REMINDER_DAYS dias. */
export function backupOverdue(lastBackupAt: string | null, now = new Date()): boolean {
  if (!lastBackupAt) return true;
  return now.getTime() - new Date(lastBackupAt).getTime() > BACKUP_REMINDER_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Cópia de segurança completa do banco local num único arquivo JSON, que o
 * usuário guarda onde quiser (Google Drive, iCloud, e-mail...). Restaurar
 * substitui todos os dados do aparelho pelos do arquivo.
 */
export function backupService(db: SqlDatabase) {
  return {
    async exportData(): Promise<BackupFile> {
      const data: BackupFile['data'] = {};

      for (const table of TABLES) {
        const rows = await db.getAllAsync<Record<string, SqlParam>>(`SELECT * FROM ${table}`);
        data[table] = table === 'settings' ? rows.filter((row) => !DEVICE_ONLY_SETTINGS.includes(String(row.key))) : rows;
      }

      return { format: BACKUP_FORMAT, schema_version: SCHEMA_VERSION, exported_at: new Date().toISOString(), data };
    },

    parse(json: string): BackupFile {
      let parsed: unknown;
      try {
        parsed = JSON.parse(json);
      } catch {
        throw new InvalidBackupError('O arquivo não é um backup válido do OpenNutri BR.');
      }

      const backup = parsed as Partial<BackupFile>;
      if (backup?.format !== BACKUP_FORMAT || typeof backup.data !== 'object') {
        throw new InvalidBackupError('O arquivo não é um backup válido do OpenNutri BR.');
      }
      if ((backup.schema_version ?? 0) > SCHEMA_VERSION) {
        throw new InvalidBackupError('Este backup foi gerado por uma versão mais nova do app. Atualize o app para restaurá-lo.');
      }

      return backup as BackupFile;
    },

    async restore(backup: BackupFile): Promise<void> {
      // Notificações não são restauradas: IDs de outro aparelho não valem aqui.
      const clearNotificationIds = (table: Table, row: Record<string, SqlParam>) =>
        table === 'tasks' || table === 'appointments' ? { ...row, notification_id: null } : row;

      const deviceSettings = await db.getAllAsync<Record<string, SqlParam>>(
        `SELECT * FROM settings WHERE key IN (${DEVICE_ONLY_SETTINGS.map(() => '?').join(', ')})`,
        DEVICE_ONLY_SETTINGS,
      );

      await db.execAsync('BEGIN;');
      try {
        for (const table of [...TABLES].reverse()) {
          await db.runAsync(`DELETE FROM ${table}`);
        }

        for (const table of TABLES) {
          const rows = table === 'settings'
            ? [...(backup.data.settings ?? []).filter((row) => !DEVICE_ONLY_SETTINGS.includes(String(row.key))), ...deviceSettings]
            : (backup.data[table] ?? []);
          for (const original of rows) {
            const row = clearNotificationIds(table, original);
            const columns = Object.keys(row);
            await db.runAsync(
              `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
              columns.map((column) => row[column]),
            );
          }
        }

        await db.execAsync('COMMIT;');
      } catch (error) {
        await db.execAsync('ROLLBACK;');
        throw error;
      }

      notifyChange(...TABLES);
    },
  };
}
