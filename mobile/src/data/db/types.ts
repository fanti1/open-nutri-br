export type SqlParam = string | number | null;

/**
 * O subconjunto do SQLite que o app usa. O expo-sqlite (aparelho e navegador)
 * já tem exatamente esses métodos; nos testes, um adaptador sobre sql.js
 * implementa a mesma interface — os repositórios não sabem qual estão usando.
 */
export interface SqlDatabase {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: SqlParam[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T>(sql: string, params?: SqlParam[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, params?: SqlParam[]): Promise<T | null>;
}
