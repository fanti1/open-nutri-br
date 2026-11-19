import { notifyChange } from '../changes';
import type { SqlDatabase, SqlParam } from '../db/types';
import { newId, nowIso } from '../ids';
import type { MealPlan, MealPlanItem, MealPlanKind } from '../models';

export interface MealPlanInput {
  patient_id?: string | null;
  kind: MealPlanKind;
  title: string;
  target_kcal?: number | null;
  reference_date?: string | null;
  notes?: string | null;
}

export interface MealPlanItemInput {
  meal: string;
  food_id: number;
  food_name: string;
  quantity_g: number;
  household_measure?: string | null;
}

export interface MealPlanWithPatient extends MealPlan {
  patient_name: string | null;
  item_count: number;
}

/** Colunas que update()/updateItem() podem alterar — o nome vira SQL, então só da lista. */
const PLAN_COLUMNS = ['title', 'target_kcal', 'reference_date', 'notes'] as const;
const ITEM_COLUMNS = ['quantity_g', 'household_measure', 'meal'] as const;

/** Linhas por INSERT ao copiar um plano (9 parâmetros cada: bem abaixo do limite do SQLite). */
const INSERT_BATCH = 100;

function assignments<T extends object>(fields: T, allowed: readonly string[]): [string, SqlParam][] {
  return Object.entries(fields)
    .filter(([key]) => allowed.includes(key))
    .map(([key, value]) => [key, (value ?? null) as SqlParam]);
}

/** Planos alimentares e recordatórios 24 h, com seus alimentos. */
export function mealPlansRepository(db: SqlDatabase) {
  const touch = (planId: string) => db.runAsync('UPDATE meal_plans SET updated_at = ? WHERE id = ?', [nowIso(), planId]);

  return {
    list(patientId?: string): Promise<MealPlanWithPatient[]> {
      return db.getAllAsync<MealPlanWithPatient>(
        `SELECT mp.*, p.name AS patient_name, (SELECT COUNT(*) FROM meal_plan_items i WHERE i.plan_id = mp.id) AS item_count
         FROM meal_plans mp LEFT JOIN patients p ON p.id = mp.patient_id
         ${patientId ? 'WHERE mp.patient_id = ?' : ''}
         ORDER BY mp.updated_at DESC`,
        patientId ? [patientId] : [],
      );
    },

    get(id: string): Promise<MealPlanWithPatient | null> {
      return db.getFirstAsync<MealPlanWithPatient>(
        `SELECT mp.*, p.name AS patient_name, (SELECT COUNT(*) FROM meal_plan_items i WHERE i.plan_id = mp.id) AS item_count
         FROM meal_plans mp LEFT JOIN patients p ON p.id = mp.patient_id WHERE mp.id = ?`,
        [id],
      );
    },

    items(planId: string): Promise<MealPlanItem[]> {
      return db.getAllAsync<MealPlanItem>('SELECT * FROM meal_plan_items WHERE plan_id = ? ORDER BY position ASC, created_at ASC', [planId]);
    },

    async create(input: MealPlanInput): Promise<string> {
      const id = newId();
      const now = nowIso();
      await db.runAsync(
        `INSERT INTO meal_plans (id, patient_id, kind, title, target_kcal, reference_date, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, input.patient_id ?? null, input.kind, input.title, input.target_kcal ?? null, input.reference_date ?? null, input.notes ?? null, now, now],
      );
      notifyChange('meal_plans');
      return id;
    },

    async update(id: string, fields: Partial<Pick<MealPlan, (typeof PLAN_COLUMNS)[number]>>): Promise<void> {
      const entries = assignments(fields, PLAN_COLUMNS);
      if (!entries.length) return;
      await db.runAsync(
        `UPDATE meal_plans SET ${entries.map(([key]) => `${key} = ?`).join(', ')}, updated_at = ? WHERE id = ?`,
        [...entries.map(([, value]) => value), nowIso(), id],
      );
      notifyChange('meal_plans');
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM meal_plans WHERE id = ?', [id]);
      notifyChange('meal_plans', 'meal_plan_items');
    },

    /** Copia o plano com todos os alimentos (ex.: partir do plano anterior no retorno). */
    async duplicate(id: string, title: string): Promise<string> {
      const plan = await this.get(id);
      if (!plan) throw new Error('Plano não encontrado.');
      const copyId = await this.create({ ...plan, title });
      const items = await this.items(id);

      // Mesma ordem e numeração que addItem() daria item a item (0, 1, 2… por
      // refeição), mas num INSERT por lote e um único aviso às telas — e não
      // três idas ao banco e uma recarga geral por alimento.
      const nextPosition = new Map<string, number>();
      const now = nowIso();
      const rows = items.map((item) => {
        const position = nextPosition.get(item.meal) ?? 0;
        nextPosition.set(item.meal, position + 1);
        return [newId(), copyId, item.meal, item.food_id, item.food_name, item.quantity_g, item.household_measure ?? null, position, now];
      });

      for (let start = 0; start < rows.length; start += INSERT_BATCH) {
        const batch = rows.slice(start, start + INSERT_BATCH);
        await db.runAsync(
          `INSERT INTO meal_plan_items (id, plan_id, meal, food_id, food_name, quantity_g, household_measure, position, created_at)
           VALUES ${batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}`,
          batch.flat(),
        );
      }

      if (rows.length) notifyChange('meal_plans', 'meal_plan_items');
      return copyId;
    },

    async addItem(planId: string, input: MealPlanItemInput): Promise<string> {
      const id = newId();
      const row = await db.getFirstAsync<{ next: number }>(
        'SELECT COALESCE(MAX(position), -1) + 1 AS next FROM meal_plan_items WHERE plan_id = ? AND meal = ?',
        [planId, input.meal],
      );
      await db.runAsync(
        `INSERT INTO meal_plan_items (id, plan_id, meal, food_id, food_name, quantity_g, household_measure, position, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, planId, input.meal, input.food_id, input.food_name, input.quantity_g, input.household_measure ?? null, row?.next ?? 0, nowIso()],
      );
      await touch(planId);
      notifyChange('meal_plans', 'meal_plan_items');
      return id;
    },

    async updateItem(id: string, fields: Partial<Pick<MealPlanItem, (typeof ITEM_COLUMNS)[number]>>): Promise<void> {
      const entries = assignments(fields, ITEM_COLUMNS);
      if (!entries.length) return;
      await db.runAsync(`UPDATE meal_plan_items SET ${entries.map(([key]) => `${key} = ?`).join(', ')} WHERE id = ?`, [
        ...entries.map(([, value]) => value),
        id,
      ]);
      const item = await db.getFirstAsync<{ plan_id: string }>('SELECT plan_id FROM meal_plan_items WHERE id = ?', [id]);
      if (item) await touch(item.plan_id);
      notifyChange('meal_plans', 'meal_plan_items');
    },

    async removeItem(id: string): Promise<void> {
      const item = await db.getFirstAsync<{ plan_id: string }>('SELECT plan_id FROM meal_plan_items WHERE id = ?', [id]);
      await db.runAsync('DELETE FROM meal_plan_items WHERE id = ?', [id]);
      if (item) await touch(item.plan_id);
      notifyChange('meal_plans', 'meal_plan_items');
    },
  };
}
