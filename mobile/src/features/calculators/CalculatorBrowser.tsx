import { useDeferredValue, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../data/DataProvider';
import { useFavorites } from '../../data/hooks';
import type { LifeStage } from '../../domain/calculators/types';
import { CATALOG, searchCatalog, type CatalogEntry } from '../../domain/catalog';
import { EmptyState } from '../../ui/EmptyState';
import { Section } from '../../ui/Section';
import { TextField } from '../../ui/TextField';
import { AudienceCatalog } from './AudienceCatalog';
import { CalculatorGroup } from './CalculatorRow';

/** Busca + áreas de um público fixo (ex.: a faixa etária do paciente). */
export function CalculatorBrowser({ onOpen, lifeStage }: { onOpen: (entry: CatalogEntry) => void; lifeStage: LifeStage }) {
  const { settings } = useData();
  const { data: favoriteSlugs = [] } = useFavorites();
  const [search, setSearch] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const favorites = new Set(favoriteSlugs);

  const available = useMemo(() => CATALOG.filter((entry) => entry.life_stages.includes(lifeStage)), [lifeStage]);
  const query = useDeferredValue(search);
  const results = useMemo(() => searchCatalog(query, available), [query, available]);
  const toggleFavorite = (entry: CatalogEntry) => settings.toggleFavorite(entry.slug);

  return (
    <View style={{ gap: 20 }}>
      <TextField value={search} onChangeText={setSearch} placeholder="Buscar método (ex.: IMC, GLIM, OMS)" icon="search" clearable />

      {query.trim() ? (
        results.length ? (
          <Section title={`${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}>
            <CalculatorGroup entries={results} onOpen={onOpen} favorites={favorites} onToggleFavorite={toggleFavorite} showModule stages="exclusive" />
          </Section>
        ) : (
          <EmptyState icon="search-outline" title="Nada encontrado" message="Tente outro nome, sigla ou autor do método." />
        )
      ) : (
        <AudienceCatalog audience={lifeStage} area={area} onAreaChange={setArea} onOpen={onOpen} favorites={favorites} onToggleFavorite={toggleFavorite} />
      )}
    </View>
  );
}
