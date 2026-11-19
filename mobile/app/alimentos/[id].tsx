import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { formatTacoValue, TACO_LEGEND, tacoFood, type TacoFood } from '../../src/domain/foods';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Card } from '../../src/ui/Card';
import { EmptyState } from '../../src/ui/EmptyState';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';

type Row = [keyof TacoFood, string];

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: 'Composição centesimal',
    rows: [
      ['energy_kcal', 'Energia (kcal)'],
      ['protein_g', 'Proteína (g)'],
      ['carbohydrate_g', 'Carboidrato (g)'],
      ['lipid_g', 'Lipídios (g)'],
      ['fiber_g', 'Fibra alimentar (g)'],
      ['cholesterol_mg', 'Colesterol (mg)'],
      ['moisture_pct', 'Umidade (%)'],
      ['ash_g', 'Cinzas (g)'],
    ],
  },
  {
    title: 'Ácidos graxos',
    rows: [
      ['saturated_fat_g', 'Saturados (g)'],
      ['monounsaturated_fat_g', 'Monoinsaturados (g)'],
      ['polyunsaturated_fat_g', 'Poli-insaturados (g)'],
    ],
  },
  {
    title: 'Minerais',
    rows: [
      ['calcium_mg', 'Cálcio (mg)'],
      ['iron_mg', 'Ferro (mg)'],
      ['sodium_mg', 'Sódio (mg)'],
      ['potassium_mg', 'Potássio (mg)'],
      ['magnesium_mg', 'Magnésio (mg)'],
      ['phosphorus_mg', 'Fósforo (mg)'],
      ['zinc_mg', 'Zinco (mg)'],
      ['copper_mg', 'Cobre (mg)'],
      ['manganese_mg', 'Manganês (mg)'],
    ],
  },
  {
    title: 'Vitaminas',
    rows: [
      ['vitamin_a_rae_mcg', 'Vitamina A — RAE (mcg)'],
      ['retinol_mcg', 'Retinol (mcg)'],
      ['vitamin_c_mg', 'Vitamina C (mg)'],
      ['thiamine_mg', 'Tiamina — B1 (mg)'],
      ['riboflavin_mg', 'Riboflavina — B2 (mg)'],
      ['pyridoxine_mg', 'Piridoxina — B6 (mg)'],
      ['niacin_mg', 'Niacina (mg)'],
    ],
  },
];

export default function FoodScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const food = tacoFood(Number(id));

  if (!food) {
    return (
      <Screen back title="Alimento">
        <EmptyState icon="nutrition-outline" title="Alimento não encontrado" />
      </Screen>
    );
  }

  return (
    <Screen back title={food.name} subtitle={`${food.group} · por 100 g`}>
      {GROUPS.map((group) => (
        <Section key={group.title} title={group.title}>
          <Card padded={false}>
            {group.rows.map(([key, label], index) => (
              <View
                key={key}
                style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}
              >
                <AppText tone="muted">{label}</AppText>
                <AppText variant="bodyStrong">{formatTacoValue(food[key] as TacoFood['energy_kcal'])}</AppText>
              </View>
            ))}
          </Card>
        </Section>
      ))}
      <AppText variant="small" tone="subtle">
        {TACO_LEGEND}
      </AppText>
      <AppText variant="small" tone="subtle">
        Fonte: TACO — Tabela Brasileira de Composição de Alimentos, 4ª edição revisada e ampliada (NEPA-UNICAMP, 2011).
      </AppText>
    </Screen>
  );
}
