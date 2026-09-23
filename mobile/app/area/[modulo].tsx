import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useFavorites } from '../../src/data/hooks';
import { STAGES } from '../../src/domain/calculatorProfile';
import { LIFE_STAGE_LABELS } from '../../src/domain/calculators/support/lifeStage';
import type { LifeStage } from '../../src/domain/calculators/types';
import { CATALOG, categoriesOf, moduleInfo, type CatalogEntry } from '../../src/domain/catalog';
import { CalculatorGroup } from '../../src/features/calculators/CalculatorRow';
import { Segmented } from '../../src/ui/Chips';
import { EmptyState } from '../../src/ui/EmptyState';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';

type StageFilter = 'todas' | LifeStage;

/** Uma área (ex.: Consultório): métodos separados por tema, com filtro por faixa etária. */
export default function AreaScreen() {
  const { modulo } = useLocalSearchParams<{ modulo: string }>();
  const router = useRouter();
  const { settings } = useData();
  const { data: favoriteSlugs = [] } = useFavorites();
  const [stage, setStage] = useState<StageFilter>('todas');

  const module = moduleInfo(modulo);
  const entries = useMemo(() => CATALOG.filter((entry) => entry.module === modulo), [modulo]);
  const stagesInArea = STAGES.filter((s) => entries.some((entry) => entry.life_stages.includes(s)));
  const filtered = stage === 'todas' ? entries : entries.filter((entry) => entry.life_stages.includes(stage));
  const favorites = new Set(favoriteSlugs);

  if (!module) {
    return (
      <Screen back title="Área">
        <EmptyState icon="alert-circle-outline" title="Área não encontrada" />
      </Screen>
    );
  }

  const open = (entry: CatalogEntry) => router.push(`/calculadora/${entry.slug}`);

  return (
    <Screen back title={module.label} subtitle={module.description}>
      {stagesInArea.length > 1 && (
        <Segmented<StageFilter>
          options={[{ value: 'todas', label: 'Todas as idades' }, ...stagesInArea.map((s) => ({ value: s, label: LIFE_STAGE_LABELS[s] }))]}
          value={stage}
          onChange={setStage}
        />
      )}

      <View style={{ gap: 28 }}>
        {categoriesOf(filtered).map((group) => (
          <Section
            key={group.category}
            size="lg"
            title={group.label}
            description={`${group.entries.length} ${group.entries.length === 1 ? 'método' : 'métodos'}`}
          >
            <CalculatorGroup
              entries={group.entries}
              onOpen={open}
              favorites={favorites}
              onToggleFavorite={(entry) => settings.toggleFavorite(entry.slug)}
            />
          </Section>
        ))}
      </View>
    </Screen>
  );
}
