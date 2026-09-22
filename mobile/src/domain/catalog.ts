import type { Ionicons } from '@expo/vector-icons';
import rawCatalog from '../data/catalog.json';
import type { LifeStage } from './calculators/types';

type IconName = keyof typeof Ionicons.glyphMap;

/** Uma calculadora do catálogo (gerado pelo backend com `php artisan catalog:export`). */
export interface CatalogEntry {
  slug: string;
  module: string;
  category: string;
  name: string;
  short_description: string;
  icon_key: string;
  formula_reference: string;
  input_schema: Record<string, unknown>;
  life_stages: LifeStage[];
  sort_order: number;
}

export const CATALOG: CatalogEntry[] = rawCatalog as CatalogEntry[];

const BY_SLUG = new Map(CATALOG.map((entry) => [entry.slug, entry]));

export function catalogEntry(slug: string): CatalogEntry | undefined {
  return BY_SLUG.get(slug);
}

export const MODULES: Array<{ key: string; label: string; icon: IconName }> = [
  { key: 'ambulatorio', label: 'Consultório', icon: 'medkit-outline' },
  { key: 'hospitalar', label: 'Hospitalar / Terapia Intensiva', icon: 'business-outline' },
  { key: 'pediatria', label: 'Pediatria', icon: 'happy-outline' },
  { key: 'bioquimica', label: 'Hematologia e Bioquímica', icon: 'flask-outline' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  antropometria: 'Antropometria',
  metabolismo: 'Metabolismo',
  triagem_risco: 'Triagem e diagnóstico',
  suporte_nutricional: 'Suporte nutricional',
  curvas_crescimento: 'Curvas de crescimento (OMS)',
  classificacao_nutricional: 'Classificação nutricional',
  gasto_energetico: 'Gasto energético',
  hematologia: 'Hematologia',
  glicemia: 'Glicemia e insulina',
  perfil_lipidico: 'Perfil lipídico',
  funcao_renal: 'Função renal',
};

const ICONS: Record<string, IconName> = {
  scale: 'barbell-outline',
  target: 'locate-outline',
  'trend-down': 'trending-down-outline',
  circle: 'ellipse-outline',
  'pie-chart': 'pie-chart-outline',
  flame: 'flame-outline',
  activity: 'pulse-outline',
  zap: 'flash-outline',
  calculator: 'calculator-outline',
  drumstick: 'nutrition-outline',
  droplet: 'water-outline',
  droplets: 'beaker-outline',
  'clipboard-check': 'clipboard-outline',
  'clipboard-list': 'list-outline',
  'shield-alert': 'shield-outline',
  'user-check': 'person-outline',
  stethoscope: 'medkit-outline',
  flask: 'flask-outline',
  'trending-up': 'trending-up-outline',
  'heart-pulse': 'heart-outline',
  ruler: 'resize-outline',
  percent: 'stats-chart-outline',
  layers: 'layers-outline',
  blood: 'water-outline',
  glucose: 'cube-outline',
  kidney: 'filter-outline',
};

export function catalogIcon(entry: CatalogEntry): IconName {
  return ICONS[entry.icon_key] ?? 'calculator-outline';
}

export type ResultTone = 'success' | 'warning' | 'danger' | 'info';

/** Códigos que as palavras-chave abaixo classificariam errado (ex.: "pre_diabetes" contém "diabetes"). */
const EXPLICIT_TONES: Record<string, ResultTone> = {
  normoglicemia: 'success',
  pre_diabetes: 'warning',
  compativel_com_diabetes: 'danger',
  deficiencia_de_ferro: 'warning',
  resistencia_insulinica: 'warning',
  perfil_desejavel: 'success',
  perfil_alterado: 'warning',
  g1_normal_ou_elevada: 'success',
  g2_levemente_diminuida: 'warning',
  g3a_leve_a_moderadamente_diminuida: 'warning',
  g3b_moderada_a_gravemente_diminuida: 'danger',
  g4_gravemente_diminuida: 'danger',
  g5_falencia_renal: 'danger',
};

/**
 * Cor sugerida para a classificação (só apresentação — o significado clínico
 * vem do classificador de cada método). Ordem importa: "muito baixo" é perigo
 * antes de "baixo" ser atenção.
 */
export function classificationTone(code: string | null): ResultTone {
  if (!code) return 'info';
  const text = code.toLowerCase();
  if (EXPLICIT_TONES[text]) return EXPLICIT_TONES[text];

  if (/(grave|severa|acentuada|muito_|terceiro|critic|alto_risco|risco_alto|microcefalia|macrocefalia|obesidade|gravemente)/.test(text)) return 'danger';
  if (/(sem_|normal|eutrofi|adequad|bem_nutrido|baixo_risco|risco_baixo|dentro|positivo)/.test(text)) return 'success';
  if (/(risco|leve|sobrepeso|moderad|atual|pregressa|cronica|primeiro|segundo|baixo|magreza|elevado|abaixo|acima|negativo|significativa|educacao|intervencao)/.test(text)) return 'warning';
  return 'info';
}
