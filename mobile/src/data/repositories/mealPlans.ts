import { notifyChange } from '../changes';
import type { SqlDatabase } from '../db/types';
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

    async update(id: string, fields: Partial<Pick<MealPlan, 'title' | 'target_kcal' | 'reference_date' | 'notes'>>): Promise<void> {
      const entries = Object.entries(fields);
      if (!entries.length) return;
      await db.runAsync(
        `UPDATE meal_plans SET ${entries.map(([key]) => `${key} = ?`).join(', ')}, updated_at = ? WHERE id = ?`,
        [...entries.map(([, value]) => value ?? null), nowIso(), id],
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
      for (const item of await this.items(id)) {
        await this.addItem(copyId, item);
      }
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

    async updateItem(id: string, fields: Partial<Pick<MealPlanItem, 'quantity_g' | 'household_measure' | 'meal'>>): Promise<void> {
      const entries = Object.entries(fields);
      if (!entries.length) return;
      await db.runAsync(`UPDATE meal_plan_items SET ${entries.map(([key]) => `${key} = ?`).join(', ')} WHERE id = ?`, [
        ...entries.map(([, value]) => value ?? null),
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
