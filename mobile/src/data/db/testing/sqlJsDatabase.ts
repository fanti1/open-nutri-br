import initSqlJs from 'sql.js';
import type { SqlDatabase, SqlParam } from '../types';

/** Implementação de SqlDatabase sobre sql.js (SQLite em memória), só para testes. */
export async function createTestDatabase(): Promise<SqlDatabase> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const all = <T>(sql: string, params: SqlParam[] = []): T[] => {
    const statement = db.prepare(sql);
    statement.bind(params);
    const rows: T[] = [];
    while (statement.step()) rows.push(statement.getAsObject() as T);
    statement.free();
    return rows;
  };

  return {
    async execAsync(sql) {
      db.exec(sql);
    },
    async runAsync(sql, params = []) {
      db.run(sql, params);
      const lastId = all<{ id: number }>('SELECT last_insert_rowid() AS id')[0]?.id ?? 0;
      return { lastInsertRowId: lastId, changes: db.getRowsModified() };
    },
    async getAllAsync<T>(sql: string, params: SqlParam[] = []) {
      return all<T>(sql, params);
    },
    async getFirstAsync<T>(sql: string, params: SqlParam[] = []) {
      return all<T>(sql, params)[0] ?? null;
    },
  };
}
