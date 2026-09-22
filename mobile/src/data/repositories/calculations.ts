import { notifyChange } from '../changes';
import type { SqlDatabase } from '../db/types';
import { newId, nowIso } from '../ids';
import type { SavedCalculation } from '../models';

export interface CalculationInput {
  patient_id?: string | null;
  consultation_id?: string | null;
  calculator_slug: string;
  calculator_name: string;
  inputs: Record<string, unknown>;
  values: Record<string, number>;
  classification: string | null;
  formula_version: string;
}

interface CalculationRow {
  id: string;
  patient_id: string | null;
  consultation_id: string | null;
  calculator_slug: string;
  calculator_name: string;
  inputs: string;
  result_values: string;
  classification: string | null;
  formula_version: string;
  created_at: string;
}

function toModel(row: CalculationRow): SavedCalculation {
  return {
    id: row.id,
    patient_id: row.patient_id,
    consultation_id: row.consultation_id,
    calculator_slug: row.calculator_slug,
    calculator_name: row.calculator_name,
    inputs: JSON.parse(row.inputs),
    values: JSON.parse(row.result_values),
    classification: row.classification,
    formula_version: row.formula_version,
    created_at: row.created_at,
  };
}

/** Cálculos salvos (na ficha do paciente ou avulsos), com a versão da fórmula usada. */
export function calculationsRepository(db: SqlDatabase) {
  return {
    async listByPatient(patientId: string): Promise<SavedCalculation[]> {
      const rows = await db.getAllAsync<CalculationRow>(
        'SELECT * FROM calculations WHERE patient_id = ? ORDER BY created_at DESC',
        [patientId],
      );
      return rows.map(toModel);
    },

    async recent(limit = 10): Promise<SavedCalculation[]> {
      const rows = await db.getAllAsync<CalculationRow>('SELECT * FROM calculations ORDER BY created_at DESC LIMIT ?', [limit]);
      return rows.map(toModel);
    },

    /** Calculadoras usadas com mais frequência — alimentam o "Acesso Rápido". */
    mostUsedSlugs(limit = 6): Promise<string[]> {
      return db
        .getAllAsync<{ calculator_slug: string }>(
          `SELECT calculator_slug FROM calculations GROUP BY calculator_slug ORDER BY COUNT(*) DESC, MAX(created_at) DESC LIMIT ?`,
          [limit],
        )
        .then((rows) => rows.map((row) => row.calculator_slug));
    },

    async create(input: CalculationInput): Promise<string> {
      const id = newId();
      await db.runAsync(
        `INSERT INTO calculations (id, patient_id, consultation_id, calculator_slug, calculator_name,
           inputs, result_values, classification, formula_version, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, input.patient_id ?? null, input.consultation_id ?? null, input.calculator_slug, input.calculator_name,
          JSON.stringify(input.inputs), JSON.stringify(input.values), input.classification, input.formula_version, nowIso(),
        ],
      );
      notifyChange('calculations');
      return id;
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM calculations WHERE id = ?', [id]);
      notifyChange('calculations');
    },
  };
}
