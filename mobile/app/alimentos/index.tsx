import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { formatTacoValue, searchTaco, tacoGroups } from '../../src/domain/foods';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Card } from '../../src/ui/Card';
import { EmptyState } from '../../src/ui/EmptyState';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';
import { TextField } from '../../src/ui/TextField';

const MAX_RESULTS = 60;

/** Tabela TACO completa no aparelho: busca por nome ou navegação por grupo, sem internet. */
export default function FoodsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<string | null>(null);

  const groups = useMemo(() => tacoGroups(), []);
  const browsing = !search.trim() && !group;
  const results = useMemo(() => (browsing ? [] : searchTaco(search, group ?? undefined)), [browsing, search, group]);

  return (
    <Screen back title="Tabela Nutricional" subtitle="TACO 4ª edição · valores por 100 g · funciona sem internet">
      <TextField value={search} onChangeText={setSearch} placeholder="Buscar alimento (ex.: feijão cozido)" icon="search" />

      {group && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setGroup(null)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <AppText variant="caption" tone="primary">
            {group}
          </AppText>
          <Ionicons name="close" size={16} color={colors.primary} />
        </Pressable>
      )}

      {browsing ? (
        <Section size="lg" title="Grupos de alimentos" description={`${groups.reduce((sum, g) => sum + g.count, 0)} alimentos em ${groups.length} grupos`}>
          <Card padded={false} style={{ overflow: 'hidden' }}>
            {groups.map((item, index) => (
              <Pressable
                key={item.name}
                accessibilityRole="button"
                onPress={() => setGroup(item.name)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderTopWidth: index ? 1 : 0,
                  borderTopColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <AppText variant="bodyStrong" style={{ flex: 1 }}>
                  {item.name}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {item.count}
                </AppText>
                <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} style={{ marginLeft: 8 }} />
              </Pressable>
            ))}
          </Card>
        </Section>
      ) : results.length ? (
        <Section title={`${results.length} ${results.length === 1 ? 'alimento' : 'alimentos'}${results.length > MAX_RESULTS ? ` — mostrando ${MAX_RESULTS}` : ''}`}>
          <Card padded={false} style={{ overflow: 'hidden' }}>
            {results.slice(0, MAX_RESULTS).map((food, index) => (
              <Pressable
                key={food.id}
                accessibilityRole="button"
                accessibilityLabel={food.name}
                onPress={() => router.push(`/alimentos/${food.id}`)}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  gap: 2,
                  borderTopWidth: index ? 1 : 0,
                  borderTopColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <AppText variant="bodyStrong">{food.name}</AppText>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                  <AppText variant="caption" tone="primary">
                    {formatTacoValue(food.energy_kcal)} kcal
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    P {formatTacoValue(food.protein_g)} · C {formatTacoValue(food.carbohydrate_g)} · L {formatTacoValue(food.lipid_g)} g
                  </AppText>
                </View>
              </Pressable>
            ))}
          </Card>
        </Section>
      ) : (
        <EmptyState icon="nutrition-outline" title="Nenhum alimento encontrado" message="Tente outro termo, sem acento ou com menos palavras." />
      )}
    </Screen>
  );
}
