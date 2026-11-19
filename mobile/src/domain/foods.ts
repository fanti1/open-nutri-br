import { formatNumber } from '../lib/format';
import { normalizeSearch } from './catalog';

/**
 * Tabela Brasileira de Composição de Alimentos (TACO, 4ª edição, NEPA-UNICAMP,
 * 2011), embarcada no app — gerada da planilha oficial por scripts/build-taco.mjs.
 * Valores por 100 g da parte comestível.
 */

/** Número, ou uma marcação da legenda oficial: traço, não aplicável, em reavaliação; null = não analisado. */
export type TacoValue = number | 'Tr' | 'NA' | '*' | null;

export interface TacoFood {
  id: number;
  name: string;
  group: string;
  moisture_pct: TacoValue;
  energy_kcal: TacoValue;
  protein_g: TacoValue;
  lipid_g: TacoValue;
  cholesterol_mg: TacoValue;
  carbohydrate_g: TacoValue;
  fiber_g: TacoValue;
  ash_g: TacoValue;
  calcium_mg: TacoValue;
  magnesium_mg: TacoValue;
  manganese_mg: TacoValue;
  phosphorus_mg: TacoValue;
  iron_mg: TacoValue;
  sodium_mg: TacoValue;
  potassium_mg: TacoValue;
  copper_mg: TacoValue;
  zinc_mg: TacoValue;
  retinol_mcg: TacoValue;
  vitamin_a_rae_mcg: TacoValue;
  thiamine_mg: TacoValue;
  riboflavin_mg: TacoValue;
  pyridoxine_mg: TacoValue;
  niacin_mg: TacoValue;
  vitamin_c_mg: TacoValue;
  saturated_fat_g?: TacoValue;
  monounsaturated_fat_g?: TacoValue;
  polyunsaturated_fat_g?: TacoValue;
}

interface TacoIndex {
  foods: TacoFood[];
  byId: Map<number, TacoFood>;
  /** Nome sem acento e em minúsculas, na mesma ordem de `foods` — a busca roda a cada tecla. */
  searchable: string[];
}

let index: TacoIndex | null = null;

/** Carregada (e indexada) só quando a tabela é usada pela primeira vez. */
function taco(): TacoIndex {
  if (!index) {
    const foods = require('../data/taco.json') as TacoFood[];
    index = { foods, byId: new Map(foods.map((food) => [food.id, food])), searchable: foods.map((food) => normalizeSearch(food.name)) };
  }
  return index;
}

export function tacoGroups(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const food of taco().foods) counts.set(food.group, (counts.get(food.group) ?? 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

export function tacoFood(id: number): TacoFood | undefined {
  return taco().byId.get(id);
}

/** Busca sem acento; várias palavras precisam aparecer todas (ex.: "feijao cozido"). */
export function searchTaco(term: string, group?: string): TacoFood[] {
  const words = normalizeSearch(term.trim()).split(/\s+/).filter(Boolean);
  const { foods, searchable } = taco();
  return foods.filter((food, i) => {
    if (group && food.group !== group) return false;
    return words.every((word) => searchable[i].includes(word));
  });
}

/** Valor como aparece na TACO impressa (vírgula decimal, "Tr", "NA"…). */
export function formatTacoValue(value: TacoValue | undefined): string {
  if (value === null || value === undefined) return '—';
  if (value === 'Tr') return 'Tr';
  if (value === 'NA') return 'NA';
  if (value === '*') return 'em reavaliação';
  return formatNumber(value);
}

export const TACO_LEGEND =
  'Tr: traço (presente em quantidade mínima) · NA: não aplicável · em reavaliação: análise sendo refeita pela TACO · —: não analisado.';
