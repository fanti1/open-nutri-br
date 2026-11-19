import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { formatTacoValue, searchTaco, type TacoFood } from '../../domain/foods';
import { parseDecimal } from '../../domain/forms/parseForm';
import { nutrientAmount } from '../../domain/nutrition';
import { formatNumber } from '../../lib/format';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Button } from '../../ui/Button';
import { ChipGroup } from '../../ui/Chips';
import { Sheet } from '../../ui/Sheet';
import { TextField } from '../../ui/TextField';

const QUICK_GRAMS = ['50', '100', '150', '200'];

export interface PickedPortion {
  food: TacoFood;
  grams: number;
  household: string | null;
}

/** Converte "150", "150,5" → número; vazio ou inválido → null. */
export function parseGrams(text: string): number | null {
  const value = parseDecimal(text);
  return value !== null && value > 0 && value <= 5000 ? value : null;
}

/**
 * Busca um alimento da TACO e define a quantidade (g), com medida caseira
 * opcional — mostra na hora quantas kcal aquela porção tem.
 */
export function FoodPickerSheet({
  visible,
  mealLabel,
  onClose,
  onAdd,
}: {
  visible: boolean;
  mealLabel: string;
  onClose: () => void;
  onAdd: (portion: PickedPortion) => void;
}) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [food, setFood] = useState<TacoFood | null>(null);
  const [grams, setGrams] = useState('100');
  const [household, setHousehold] = useState('');

  // Ao fechar, zera a busca para a próxima abertura (ajuste durante a renderização, sem efeito).
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (!visible) {
      setSearch('');
      setFood(null);
      setGrams('100');
      setHousehold('');
    }
  }

  const results = useMemo(() => (search.trim().length >= 2 ? searchTaco(search).slice(0, 30) : []), [search]);
  const parsedGrams = parseGrams(grams);
  const kcal = food && parsedGrams ? nutrientAmount(food.energy_kcal, parsedGrams) : null;

  return (
    <Sheet visible={visible} onClose={onClose} title={food ? food.name : `Adicionar ao ${mealLabel.toLowerCase()}`}>
      {food ? (
        <View style={{ gap: 14 }}>
          <AppText variant="caption" tone="muted">
            {food.group} · por 100 g: {formatTacoValue(food.energy_kcal)} kcal · P {formatTacoValue(food.protein_g)} g · C{' '}
            {formatTacoValue(food.carbohydrate_g)} g · L {formatTacoValue(food.lipid_g)} g
          </AppText>
          <TextField label="Quantidade" value={grams} onChangeText={setGrams} keyboardType="decimal-pad" unit="g" autoFocus selectTextOnFocus error={grams && !parsedGrams ? 'Informe a quantidade em gramas.' : null} />
          <ChipGroup options={QUICK_GRAMS.map((g) => ({ value: g, label: `${g} g` }))} value={QUICK_GRAMS.includes(grams) ? grams : null} onChange={setGrams} />
          <TextField label="Medida caseira (opcional)" value={household} onChangeText={setHousehold} placeholder="Ex.: 4 colheres de sopa" />
          <AppText variant="bodyStrong" tone="primary">
            {kcal === null ? (food.energy_kcal === '*' ? 'Energia em reavaliação pela TACO' : '—') : `${formatNumber(Math.round(kcal))} kcal nesta porção`}
          </AppText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Trocar alimento" variant="ghost" onPress={() => setFood(null)} style={{ flex: 1 }} />
            <Button
              label="Adicionar"
              icon="add"
              disabled={!parsedGrams}
              onPress={() => parsedGrams && onAdd({ food, grams: parsedGrams, household: household.trim() || null })}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <TextField value={search} onChangeText={setSearch} placeholder="Buscar na TACO (ex.: arroz integral)" icon="search" autoFocus clearable />
          {search.trim().length < 2 ? (
            <AppText variant="caption" tone="muted">
              Digite ao menos 2 letras. A busca ignora acentos e aceita várias palavras.
            </AppText>
          ) : results.length === 0 ? (
            <AppText variant="caption" tone="muted">
              Nenhum alimento encontrado.
            </AppText>
          ) : (
            <View>
              {results.map((item, index) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  onPress={() => setFood(item)}
                  style={({ pressed }) => ({ paddingVertical: 10, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border, opacity: pressed ? 0.7 : 1 })}
                >
                  <AppText variant="bodyStrong">{item.name}</AppText>
                  <AppText variant="caption" tone="muted">
                    {formatTacoValue(item.energy_kcal)} kcal · P {formatTacoValue(item.protein_g)} · C {formatTacoValue(item.carbohydrate_g)} · L{' '}
                    {formatTacoValue(item.lipid_g)} (100 g)
                  </AppText>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </Sheet>
  );
}
