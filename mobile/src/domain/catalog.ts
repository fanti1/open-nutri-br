import type { Ionicons } from '@expo/vector-icons';
import rawCatalog from '../data/catalog.json';
import type { AreaColor } from '../theme/tokens';
import type { LifeStage } from './calculators/types';
import type { MethodAudit } from './methodAudit';

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
  /** Versão da fórmula (a mesma gravada em cada cálculo salvo). */
  version: string;
  /** Auditoria científica do método (fontes conferidas, ressalvas, exemplo). */
  audit: MethodAudit;
}

// Gerado por `php artisan catalog:export`; a forma é verificada nos testes (calculatorSpec e methodAudit).
export const CATALOG: CatalogEntry[] = rawCatalog as unknown as CatalogEntry[];

const BY_SLUG = new Map(CATALOG.map((entry) => [entry.slug, entry]));

export function catalogEntry(slug: string): CatalogEntry | undefined {
  return BY_SLUG.get(slug);
}

export interface ModuleInfo {
  key: string;
  label: string;
  description: string;
  icon: IconName;
  /** Cor da área (coral, azul, amarelo, violeta): cabeçalho da calculadora e blocos da área. */
  colorKey: AreaColor;
}

/** Áreas de atuação — a porta de entrada das calculadoras. */
export const MODULES: ModuleInfo[] = [
  { key: 'ambulatorio', label: 'Consultório', description: 'Antropometria, composição corporal e gasto energético', icon: 'body-outline', colorKey: 'coral' },
  { key: 'hospitalar', label: 'Hospitalar e Terapia Intensiva', description: 'Triagem, suporte nutricional e ventilação mecânica', icon: 'medkit-outline', colorKey: 'sky' },
  { key: 'pediatria', label: 'Pediatria', description: 'Curvas de crescimento da OMS e necessidades', icon: 'happy-outline', colorKey: 'sun' },
  { key: 'bioquimica', label: 'Exames laboratoriais', description: 'Anemia, glicemia, lipídios e função renal', icon: 'flask-outline', colorKey: 'violet' },
];

export function moduleInfo(key: string): ModuleInfo | undefined {
  return MODULES.find((module) => module.key === key);
}

/** Calculadoras de uma área agrupadas por categoria, na ordem do catálogo. */
export function categoriesOf(entries: CatalogEntry[]): { category: string; label: string; entries: CatalogEntry[] }[] {
  const groups = new Map<string, CatalogEntry[]>();
  for (const entry of entries) groups.set(entry.category, [...(groups.get(entry.category) ?? []), entry]);
  return [...groups.entries()].map(([category, list]) => ({ category, label: CATEGORY_LABELS[category] ?? category, entries: list }));
}

export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Texto de busca de cada calculadora, normalizado uma vez só — a busca roda a cada tecla. */
let searchable: Map<CatalogEntry, string> | null = null;

function searchText(entry: CatalogEntry): string {
  searchable ??= new Map(CATALOG.map((item) => [item, normalizeSearch(`${item.name} ${item.short_description} ${item.slug}`)]));
  return searchable.get(entry) ?? normalizeSearch(`${entry.name} ${entry.short_description} ${entry.slug}`);
}

export function searchCatalog(term: string, entries: CatalogEntry[] = CATALOG): CatalogEntry[] {
  const needle = normalizeSearch(term.trim());
  if (!needle) return entries;
  return entries.filter((entry) => searchText(entry).includes(needle));
}

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
  pinch: 'hand-left-outline',
  lungs: 'fitness-outline',
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
  adiposidade_central_saudavel: 'success',
  adiposidade_central_aumentada: 'warning',
  adiposidade_central_alta: 'danger',
  risco_coronariano_elevado: 'danger',
  equacao_2003b: 'info',
  equacao_2010_idoso_com_obesidade: 'info',
  sedentario_ou_atividade_leve: 'info',
  ativo_ou_moderadamente_ativo: 'info',
  vigorosamente_ativo: 'info',
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
