import type { TacoFood, TacoValue } from './foods';

/** Refeições do dia, na ordem em que aparecem no plano. */
export const MEALS = [
  { key: 'cafe_da_manha', label: 'Café da manhã' },
  { key: 'lanche_da_manha', label: 'Lanche da manhã' },
  { key: 'almoco', label: 'Almoço' },
  { key: 'lanche_da_tarde', label: 'Lanche da tarde' },
  { key: 'jantar', label: 'Jantar' },
  { key: 'ceia', label: 'Ceia' },
] as const;

export type MealKey = (typeof MEALS)[number]['key'];

export function mealLabel(key: string): string {
  return MEALS.find((meal) => meal.key === key)?.label ?? key;
}

/** Nutrientes somados no plano (valores da TACO por 100 g). */
export const TRACKED_NUTRIENTS = [
  { key: 'energy_kcal', label: 'Energia', unit: 'kcal', decimals: 0 },
  { key: 'protein_g', label: 'Proteína', unit: 'g', decimals: 1 },
  { key: 'carbohydrate_g', label: 'Carboidrato', unit: 'g', decimals: 1 },
  { key: 'lipid_g', label: 'Lipídios', unit: 'g', decimals: 1 },
  { key: 'fiber_g', label: 'Fibra alimentar', unit: 'g', decimals: 1 },
  { key: 'saturated_fat_g', label: 'Gordura saturada', unit: 'g', decimals: 1 },
  { key: 'cholesterol_mg', label: 'Colesterol', unit: 'mg', decimals: 0 },
  { key: 'sodium_mg', label: 'Sódio', unit: 'mg', decimals: 0 },
  { key: 'potassium_mg', label: 'Potássio', unit: 'mg', decimals: 0 },
  { key: 'calcium_mg', label: 'Cálcio', unit: 'mg', decimals: 0 },
  { key: 'iron_mg', label: 'Ferro', unit: 'mg', decimals: 1 },
  { key: 'magnesium_mg', label: 'Magnésio', unit: 'mg', decimals: 0 },
  { key: 'zinc_mg', label: 'Zinco', unit: 'mg', decimals: 1 },
  { key: 'vitamin_a_rae_mcg', label: 'Vitamina A (RAE)', unit: 'mcg', decimals: 0 },
  { key: 'vitamin_c_mg', label: 'Vitamina C', unit: 'mg', decimals: 1 },
] as const;

export type NutrientKey = (typeof TRACKED_NUTRIENTS)[number]['key'];

export interface NutrientTotals {
  values: Record<NutrientKey, number>;
  /**
   * Nutrientes em que algum alimento não tem valor na TACO ("em reavaliação"
   * ou não analisado): o total é um mínimo, não o valor completo.
   */
  incomplete: Set<NutrientKey>;
}

/**
 * Quantidade de um nutriente em `grams` do alimento. Traço (Tr) e não
 * aplicável (NA — ex.: colesterol em vegetais) contam como zero; "*" (em
 * reavaliação) e vazio (não analisado) são desconhecidos → null.
 */
export function nutrientAmount(value: TacoValue | undefined, grams: number): number | null {
  if (value === 'Tr' || value === 'NA') return 0;
  if (value === '*' || value === null || value === undefined) return null;
  return (value * grams) / 100;
}

export function emptyTotals(): NutrientTotals {
  return {
    values: Object.fromEntries(TRACKED_NUTRIENTS.map((n) => [n.key, 0])) as Record<NutrientKey, number>,
    incomplete: new Set(),
  };
}

/** Soma os nutrientes de uma lista de alimentos (cada um com sua quantidade em gramas). */
export function sumNutrients(portions: Array<{ food: TacoFood | undefined; grams: number }>): NutrientTotals {
  const totals = emptyTotals();
  for (const { food, grams } of portions) {
    for (const { key } of TRACKED_NUTRIENTS) {
      const amount = food ? nutrientAmount(food[key], grams) : null;
      if (amount === null) totals.incomplete.add(key);
      else totals.values[key] += amount;
    }
  }
  return totals;
}

/**
 * % do valor energético vindo de proteína (4 kcal/g), carboidrato (4 kcal/g)
 * e lipídios (9 kcal/g) — fatores de Atwater, sobre a energia desses três
 * (somam 100%). Referência de adequação: AMDR do IOM (proteína 10–35%,
 * carboidrato 45–65%, lipídios 20–35% em adultos).
 */
export function macroDistribution(values: Pick<Record<NutrientKey, number>, 'protein_g' | 'carbohydrate_g' | 'lipid_g'>): {
  protein: number;
  carbohydrate: number;
  lipid: number;
} {
  const protein = values.protein_g * 4;
  const carbohydrate = values.carbohydrate_g * 4;
  const lipid = values.lipid_g * 9;
  const total = protein + carbohydrate + lipid;
  if (total === 0) return { protein: 0, carbohydrate: 0, lipid: 0 };
  return { protein: (protein / total) * 100, carbohydrate: (carbohydrate / total) * 100, lipid: (lipid / total) * 100 };
}

/** Proteína em g por kg de peso (ex.: 1,2 g/kg), quando o peso do paciente é conhecido. */
export function proteinPerKg(proteinG: number, weightKg: number | undefined): number | null {
  return weightKg ? proteinG / weightKg : null;
}
