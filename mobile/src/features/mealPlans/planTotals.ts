import type { MealPlanItem } from '../../data/models';
import { tacoFood } from '../../domain/foods';
import { parseDecimal } from '../../domain/forms/parseForm';
import { MEALS, sumNutrients, type NutrientTotals } from '../../domain/nutrition';

/** Totais do dia inteiro (valores da TACO × gramas de cada item). */
export function planTotals(items: MealPlanItem[]): NutrientTotals {
  return sumNutrients(items.map((item) => ({ food: tacoFood(item.food_id), grams: item.quantity_g })));
}

/** Itens agrupados por refeição, na ordem do dia, com o subtotal de energia de cada uma. */
export function itemsByMeal(items: MealPlanItem[]): { key: string; label: string; items: MealPlanItem[]; kcal: number }[] {
  return MEALS.map((meal) => {
    const mealItems = items.filter((item) => item.meal === meal.key);
    return { key: meal.key, label: meal.label, items: mealItems, kcal: planTotals(mealItems).values.energy_kcal };
  });
}

export function itemKcal(item: MealPlanItem): number {
  return planTotals([item]).values.energy_kcal;
}

/** Meta de energia digitada ("1800", "2.150,5"): positiva e até 10.000 kcal/dia; vazio ou inválido = sem meta. */
export function parseKcal(text: string): number | null {
  const value = parseDecimal(text.trim().replace(/\.(?=\d{3}(\D|$))/g, ''));
  return value !== null && value > 0 && value <= 10000 ? value : null;
}
