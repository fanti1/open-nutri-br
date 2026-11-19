import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
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
      const native = await SQLite.openDatabaseAsync(DATABASE_NAME);
      if (Platform.OS !== 'web') {
        // WAL: leituras não esperam gravações e cada gravação escreve menos no
        // disco. O SQLite do navegador (OPFS) não usa WAL.
        await native.execAsync('PRAGMA journal_mode = WAL;');
      }
      const db = adapt(native);
      await migrate(db);
      return db;
    })().catch((error: unknown) => {
      // Uma falha não fica guardada: "Tentar de novo" abre o banco outra vez.
      instance = null;
      throw error;
    });
  }

  return instance;
}
