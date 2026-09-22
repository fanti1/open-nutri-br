import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { getFood } from '../../src/api/foods';
import type { Food } from '../../src/api/types';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Card } from '../../src/ui/Card';
import { EmptyState } from '../../src/ui/EmptyState';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';

const GROUPS: Array<{ title: string; rows: Array<[keyof Food, string]> }> = [
  {
    title: 'Macronutrientes',
    rows: [
      ['energy_kcal', 'Energia (kcal)'],
      ['protein_g', 'Proteína (g)'],
      ['carbohydrate_g', 'Carboidrato (g)'],
      ['lipid_g', 'Lipídios (g)'],
      ['fiber_g', 'Fibra alimentar (g)'],
      ['saturated_fat_g', 'Gordura saturada (g)'],
      ['cholesterol_mg', 'Colesterol (mg)'],
    ],
  },
  {
    title: 'Micronutrientes',
    rows: [
      ['calcium_mg', 'Cálcio (mg)'],
      ['iron_mg', 'Ferro (mg)'],
      ['sodium_mg', 'Sódio (mg)'],
      ['potassium_mg', 'Potássio (mg)'],
      ['vitamin_a_mcg', 'Vitamina A (mcg)'],
      ['vitamin_c_mg', 'Vitamina C (mg)'],
    ],
  },
];

export default function FoodScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data: food, isError, error } = useQuery({ queryKey: ['food', id], queryFn: () => getFood(Number(id)) });

  if (isError) {
    return (
      <Screen back title="Alimento">
        <EmptyState icon="cloud-offline-outline" title="Indisponível" message={(error as Error).message} />
      </Screen>
    );
  }

  if (!food) return <Screen back title="Alimento" />;

  return (
    <Screen back title={food.name} subtitle={[food.food_group, food.household_portion].filter(Boolean).join(' · ') || 'Valores por 100 g'}>
      {GROUPS.map((group) => (
        <Section key={group.title} title={group.title}>
          <Card padded={false}>
            {group.rows.map(([key, label], index) => (
              <View
                key={key}
                style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}
              >
                <AppText tone="muted">{label}</AppText>
                <AppText variant="bodyStrong">{food[key] ?? '—'}</AppText>
              </View>
            ))}
          </Card>
        </Section>
      ))}
      <AppText variant="small" tone="subtle">
        Fonte: {food.source === 'taco' ? 'TACO — Tabela Brasileira de Composição de Alimentos (NEPA-UNICAMP)' : 'dados de demonstração'}.
      </AppText>
    </Screen>
  );
}
