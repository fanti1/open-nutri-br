import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { searchFoods } from '../../src/api/foods';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Card } from '../../src/ui/Card';
import { EmptyState } from '../../src/ui/EmptyState';
import { Screen } from '../../src/ui/Screen';
import { TextField } from '../../src/ui/TextField';

/** Espera o usuário parar de digitar antes de consultar o servidor. */
function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function FoodsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const term = useDebounced(search.trim());

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['foods', term],
    queryFn: () => searchFoods({ search: term || undefined }),
  });

  return (
    <Screen back title="Tabela Nutricional" subtitle="Composição de alimentos por 100 g (base TACO)">
      <TextField value={search} onChangeText={setSearch} placeholder="Buscar alimento (ex.: feijão, arroz)" icon="search" />

      {isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />}

      {isError && (
        <EmptyState icon="cloud-offline-outline" title="Tabela indisponível" message={(error as Error).message} />
      )}

      {data?.data.map((food) => (
        <Card key={food.id} onPress={() => router.push(`/alimentos/${food.id}`)} style={{ gap: 4 }}>
          <AppText variant="bodyStrong">{food.name}</AppText>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <AppText variant="caption" tone="primary">
              {food.energy_kcal ?? '—'} kcal
            </AppText>
            <AppText variant="caption" tone="muted">
              P {food.protein_g ?? '—'} g · C {food.carbohydrate_g ?? '—'} g · L {food.lipid_g ?? '—'} g
            </AppText>
          </View>
          {food.food_group && (
            <AppText variant="small" tone="subtle">
              {food.food_group}
            </AppText>
          )}
        </Card>
      ))}

      {data && data.data.length === 0 && <EmptyState icon="nutrition-outline" title="Nenhum alimento encontrado" message="Tente outro termo." />}
    </Screen>
  );
}
