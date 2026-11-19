import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useAudience, useFavorites } from '../../src/data/hooks';
import { LIFE_STAGE_PLURAL } from '../../src/domain/calculators/support/lifeStage';
import { catalogEntry, searchCatalog, type CatalogEntry } from '../../src/domain/catalog';
import { stageAgeRangeLabel } from '../../src/domain/calculatorProfile';
import { AudienceCatalog } from '../../src/features/calculators/AudienceCatalog';
import { AudienceSelector, audienceCount } from '../../src/features/calculators/AudienceSelector';
import { CalculatorGroup } from '../../src/features/calculators/CalculatorRow';
import { AppText } from '../../src/ui/AppText';
import { EmptyState } from '../../src/ui/EmptyState';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';
import { TextField } from '../../src/ui/TextField';

/**
 * Entrada das calculadoras: primeiro "para quem é o cálculo" (criança, adulto
 * ou idoso — lembrado para as próximas vezes); abaixo, só os métodos validados
 * para esse público, por área e tema.
 */
export default function CalculatorsScreen() {
  const router = useRouter();
  const { settings } = useData();
  const { data: favoriteSlugs = [] } = useFavorites();
  const [audience, setAudience] = useAudience();
  const [search, setSearch] = useState('');
  // Vindo de um bloco de área do Início, a área já abre escolhida.
  const params = useLocalSearchParams<{ area?: string }>();
  const [area, setArea] = useState<string | null>(params.area ?? null);
  const [areaParam, setAreaParam] = useState(params.area);
  if (params.area !== areaParam) {
    setAreaParam(params.area);
    if (params.area) setArea(params.area);
  }

  const favorites = new Set(favoriteSlugs);
  const query = useDeferredValue(search);
  const results = useMemo(() => searchCatalog(query), [query]);
  const audienceFavorites = favoriteSlugs
    .map(catalogEntry)
    .filter((entry): entry is CatalogEntry => !!entry && entry.life_stages.includes(audience));

  // Aberta a partir daqui, a calculadora já entra com a faixa etária escolhida.
  const open = (entry: CatalogEntry) =>
    router.push(entry.life_stages.includes(audience) ? `/calculadora/${entry.slug}?faixa=${audience}` : `/calculadora/${entry.slug}`);
  const toggleFavorite = (entry: CatalogEntry) => settings.toggleFavorite(entry.slug);

  return (
    <Screen
      title="Calculadoras"
      subtitle="Métodos científicos com referência publicada"
      hero={{
        children: <TextField value={search} onChangeText={setSearch} placeholder="Buscar método (ex.: IMC, GLIM, OMS)" icon="search" clearable raised />,
      }}
    >

      {query.trim() ? (
        results.length ? (
          <Section title={`${results.length} ${results.length === 1 ? 'resultado' : 'resultados'} em todos os públicos`}>
            <CalculatorGroup entries={results} onOpen={open} favorites={favorites} onToggleFavorite={toggleFavorite} showModule stages="all" />
          </Section>
        ) : (
          <EmptyState icon="search-outline" title="Nada encontrado" message="Tente outro nome, sigla ou autor do método." />
        )
      ) : (
        <View style={{ gap: 24 }}>
          <Section size="lg" title="Para quem é o cálculo?">
            <AudienceSelector value={audience} onChange={setAudience} />
            <AppText variant="caption" tone="muted">
              {audienceCount(audience)} métodos validados para {LIFE_STAGE_PLURAL[audience]} ({stageAgeRangeLabel(audience)}).
            </AppText>
          </Section>

          {audienceFavorites.length > 0 && (
            <Section size="lg" title="Favoritas">
              <CalculatorGroup entries={audienceFavorites} onOpen={open} favorites={favorites} onToggleFavorite={toggleFavorite} showModule stages="exclusive" />
            </Section>
          )}

          <Section size="lg" title="Por área">
            <AudienceCatalog audience={audience} area={area} onAreaChange={setArea} onOpen={open} favorites={favorites} onToggleFavorite={toggleFavorite} />
          </Section>
        </View>
      )}
    </Screen>
  );
}
