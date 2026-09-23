import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../data/DataProvider';
import { useFavorites } from '../../data/hooks';
import type { LifeStage } from '../../domain/calculators/types';
import { CATALOG, MODULES, searchCatalog, type CatalogEntry } from '../../domain/catalog';
import { EmptyState } from '../../ui/EmptyState';
import { Section } from '../../ui/Section';
import { TextField } from '../../ui/TextField';
import { CalculatorGroup } from './CalculatorRow';

interface CalculatorBrowserProps {
  onOpen: (entry: CatalogEntry) => void;
  /** Só mostra o que é validado para esta faixa etária (ex.: a do paciente). */
  lifeStage?: LifeStage;
}

/** Busca + calculadoras agrupadas por área, em listas compactas. */
export function CalculatorBrowser({ onOpen, lifeStage }: CalculatorBrowserProps) {
  const { settings } = useData();
  const { data: favoriteSlugs = [] } = useFavorites();
  const [search, setSearch] = useState('');
  const favorites = new Set(favoriteSlugs);

  const available = useMemo(() => (lifeStage ? CATALOG.filter((entry) => entry.life_stages.includes(lifeStage)) : CATALOG), [lifeStage]);
  const results = useMemo(() => searchCatalog(search, available), [search, available]);

  const toggleFavorite = (entry: CatalogEntry) => settings.toggleFavorite(entry.slug);

  return (
    <View style={{ gap: 24 }}>
      <TextField value={search} onChangeText={setSearch} placeholder="Buscar método (ex.: IMC, GLIM, OMS)" icon="search" />

      {search.trim() ? (
        results.length ? (
          <Section title={`${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}>
            <CalculatorGroup entries={results} onOpen={onOpen} favorites={favorites} onToggleFavorite={toggleFavorite} showModule />
          </Section>
        ) : (
          <EmptyState icon="search-outline" title="Nada encontrado" message="Tente outro nome, sigla ou autor do método." />
        )
      ) : (
        MODULES.map((module) => {
          const entries = available.filter((entry) => entry.module === module.key);
          if (!entries.length) return null;
          return (
            <Section key={module.key} size="lg" title={module.label} description={module.description}>
              <CalculatorGroup entries={entries} onOpen={onOpen} favorites={favorites} onToggleFavorite={toggleFavorite} />
            </Section>
          );
        })
      )}
    </View>
  );
}
