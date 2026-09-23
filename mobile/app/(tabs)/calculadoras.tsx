import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useFavorites } from '../../src/data/hooks';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { CATALOG, catalogEntry, MODULES, searchCatalog, type CatalogEntry } from '../../src/domain/catalog';
import { CalculatorGroup } from '../../src/features/calculators/CalculatorRow';
import { ModuleCard } from '../../src/features/calculators/ModuleCard';
import { EmptyState } from '../../src/ui/EmptyState';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';
import { TextField } from '../../src/ui/TextField';

/** Entrada das calculadoras: busca, favoritas, áreas de atuação e as mais usadas. */
export default function CalculatorsScreen() {
  const router = useRouter();
  const { settings, calculations } = useData();
  const { data: favoriteSlugs = [] } = useFavorites();
  const { data: mostUsed = [] } = useLiveQuery(['calculations'], () => calculations.mostUsedSlugs(5));
  const [search, setSearch] = useState('');

  const favorites = new Set(favoriteSlugs);
  const results = useMemo(() => searchCatalog(search), [search]);
  const favoriteEntries = favoriteSlugs.map(catalogEntry).filter((entry): entry is CatalogEntry => !!entry);
  const recentEntries = mostUsed
    .filter((slug) => !favorites.has(slug))
    .map(catalogEntry)
    .filter((entry): entry is CatalogEntry => !!entry);

  const open = (entry: CatalogEntry) => router.push(`/calculadora/${entry.slug}`);
  const toggleFavorite = (entry: CatalogEntry) => settings.toggleFavorite(entry.slug);

  return (
    <Screen title="Calculadoras" subtitle={`${CATALOG.length} métodos científicos, cada um com sua referência`}>
      <TextField value={search} onChangeText={setSearch} placeholder="Buscar método (ex.: IMC, GLIM, OMS)" icon="search" />

      {search.trim() ? (
        results.length ? (
          <Section title={`${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}>
            <CalculatorGroup entries={results} onOpen={open} favorites={favorites} onToggleFavorite={toggleFavorite} showModule />
          </Section>
        ) : (
          <EmptyState icon="search-outline" title="Nada encontrado" message="Tente outro nome, sigla ou autor do método." />
        )
      ) : (
        <View style={{ gap: 28 }}>
          {favoriteEntries.length > 0 && (
            <Section size="lg" title="Favoritas">
              <CalculatorGroup entries={favoriteEntries} onOpen={open} favorites={favorites} onToggleFavorite={toggleFavorite} showModule />
            </Section>
          )}

          <Section size="lg" title="Áreas" description="Escolha a área para ver os métodos organizados por tema.">
            <View style={{ gap: 10 }}>
              {MODULES.map((module) => (
                <ModuleCard
                  key={module.key}
                  module={module}
                  count={CATALOG.filter((entry) => entry.module === module.key).length}
                  onPress={() => router.push(`/area/${module.key}`)}
                />
              ))}
            </View>
          </Section>

          {recentEntries.length > 0 && (
            <Section size="lg" title="Mais usadas">
              <CalculatorGroup entries={recentEntries} onOpen={open} favorites={favorites} onToggleFavorite={toggleFavorite} showModule />
            </Section>
          )}
        </View>
      )}
    </Screen>
  );
}
