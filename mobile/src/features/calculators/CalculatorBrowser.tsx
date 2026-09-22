import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../data/DataProvider';
import { useFavorites } from '../../data/hooks';
import { LIFE_STAGE_LABELS } from '../../domain/calculators/support/lifeStage';
import type { LifeStage } from '../../domain/calculators/types';
import { CATALOG, CATEGORY_LABELS, MODULES, type CatalogEntry } from '../../domain/catalog';
import { Section } from '../../ui/Section';
import { ChipGroup } from '../../ui/Chips';
import { EmptyState } from '../../ui/EmptyState';
import { TextField } from '../../ui/TextField';
import { CalculatorRow } from './CalculatorRow';

interface CalculatorBrowserProps {
  onOpen: (entry: CatalogEntry) => void;
  /** Quando aberto a partir de um paciente, só mostra o que vale para a faixa etária dele. */
  fixedLifeStage?: LifeStage;
}

type ModuleFilter = 'todos' | string;
type StageFilter = 'todas' | LifeStage;

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Busca + filtros (módulo e faixa etária) + favoritos + lista agrupada por categoria. */
export function CalculatorBrowser({ onOpen, fixedLifeStage }: CalculatorBrowserProps) {
  const { settings } = useData();
  const { data: favoriteSlugs = [] } = useFavorites();
  const [search, setSearch] = useState('');
  const [module, setModule] = useState<ModuleFilter>('todos');
  const [stage, setStage] = useState<StageFilter>(fixedLifeStage ?? 'todas');

  const favorites = new Set(favoriteSlugs);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    return CATALOG.filter(
      (entry) =>
        (module === 'todos' || entry.module === module) &&
        (stage === 'todas' || entry.life_stages.includes(stage)) &&
        (!term || normalize(`${entry.name} ${entry.short_description}`).includes(term)),
    );
  }, [search, module, stage]);

  const groups = useMemo(() => {
    const map = new Map<string, CatalogEntry[]>();
    for (const entry of filtered) {
      const key = `${entry.module}:${entry.category}`;
      map.set(key, [...(map.get(key) ?? []), entry]);
    }
    return [...map.entries()];
  }, [filtered]);

  const favoriteEntries = CATALOG.filter((entry) => favorites.has(entry.slug) && filtered.includes(entry));
  const moduleLabel = (key: string) => MODULES.find((m) => m.key === key)?.label ?? key;

  const renderRow = (entry: CatalogEntry) => (
    <CalculatorRow
      key={entry.slug}
      entry={entry}
      favorite={favorites.has(entry.slug)}
      onPress={() => onOpen(entry)}
      onToggleFavorite={() => settings.toggleFavorite(entry.slug)}
    />
  );

  return (
    <View style={{ gap: 16 }}>
      <TextField value={search} onChangeText={setSearch} placeholder="Pesquisar cálculo (ex.: IMC, GLIM, OMS)" icon="search" />

      <ChipGroup
        scroll
        options={[{ value: 'todos', label: 'Todos os módulos' }, ...MODULES.map((m) => ({ value: m.key, label: m.label }))]}
        value={module}
        onChange={setModule}
      />

      {!fixedLifeStage && (
        <ChipGroup
          scroll
          options={[
            { value: 'todas', label: 'Todas as idades' },
            { value: 'crianca', label: LIFE_STAGE_LABELS.crianca },
            { value: 'adulto', label: LIFE_STAGE_LABELS.adulto },
            { value: 'idoso', label: LIFE_STAGE_LABELS.idoso },
          ]}
          value={stage}
          onChange={setStage}
        />
      )}

      {favoriteEntries.length > 0 && !search && (
        <Section title="Favoritas">
          <View style={{ gap: 10 }}>{favoriteEntries.map(renderRow)}</View>
        </Section>
      )}

      {groups.map(([key, entries]) => {
        const [moduleKey, category] = key.split(':');
        return (
          <Section key={key} title={`${CATEGORY_LABELS[category] ?? category} · ${moduleLabel(moduleKey)}`}>
            <View style={{ gap: 10 }}>{entries.map(renderRow)}</View>
          </Section>
        );
      })}

      {filtered.length === 0 && (
        <EmptyState icon="search-outline" title="Nenhuma calculadora encontrada" message="Tente outro termo ou limpe os filtros." />
      )}
    </View>
  );
}
