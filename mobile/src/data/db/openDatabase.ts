import * as SQLite from 'expo-sqlite';
import { migrate } from './migrations';
import type { SqlDatabase } from './types';

const DATABASE_NAME = 'opennutri.db';

let instance: Promise<SqlDatabase> | null = null;

function adapt(db: SQLite.SQLiteDatabase): SqlDatabase {
  return {
    execAsync: (sql) => db.execAsync(sql),
    runAsync: (sql, params = []) => db.runAsync(sql, params),
    getAllAsync: (sql, params = []) => db.getAllAsync(sql, params),
    getFirstAsync: (sql, params = []) => db.getFirstAsync(sql, params),
  };
}

/** Abre (uma vez por processo) o banco local do aparelho e aplica as migrações pendentes. */
export function openDatabase(): Promise<SqlDatabase> {
  if (!instance) {
    instance = (async () => {
      const db = adapt(await SQLite.openDatabaseAsync(DATABASE_NAME));
      await migrate(db);
      return db;
    })();
  }

  return instance;
}
