import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { elevation } from '../theme/tokens';
import { AppText } from './AppText';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  color?: string;
  /** Visível, mas não selecionável (ex.: faixa etária em que o método não é validado). */
  disabled?: boolean;
}

interface ChipGroupProps<T extends string> {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  scroll?: boolean;
  /** Nome do grupo para o leitor de tela (ex.: o rótulo do campo). */
  accessibilityLabel?: string;
}

/**
 * Seleção única em "pílulas" — usada em filtros e em campos de múltipla escolha.
 * A opção escolhida ganha um ✓ além da cor: a seleção não depende só de cor.
 */
export function ChipGroup<T extends string>({ options, value, onChange, scroll = false, accessibilityLabel }: ChipGroupProps<T>) {
  const { colors, radius, layout } = useTheme();

  const chips = options.map((option) => {
    const active = option.value === value;
    const tint = option.color ?? colors.primary;

    return (
      <Pressable
        key={option.value}
        accessibilityRole="radio"
        accessibilityLabel={option.label}
        accessibilityState={{ checked: active, disabled: option.disabled }}
        aria-checked={active}
        aria-disabled={option.disabled}
        disabled={option.disabled}
        onPress={() => onChange(option.value)}
        style={({ pressed }) => ({
          minHeight: layout.controlHeightSm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: active ? 14 : 16,
          borderRadius: radius.pill,
          borderWidth: 1.5,
          borderColor: active ? tint : colors.border,
          backgroundColor: active ? tint : pressed ? colors.surfacePressed : colors.surface,
          opacity: option.disabled ? 0.4 : 1,
        })}
      >
        {active && <Ionicons name="checkmark" size={15} color={colors.onPrimary} />}
        <AppText variant="label" color={active ? colors.onPrimary : colors.text} numberOfLines={1}>
          {option.label}
        </AppText>
      </Pressable>
    );
  });

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
      >
        {chips}
      </ScrollView>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {chips}
    </View>
  );
}

/** Controle segmentado (abas internas de uma tela ou escolha entre poucas opções). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  const { colors, radius, layout, dark } = useTheme();

  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4 }} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;
        const tint = option.color ?? colors.primary;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: option.disabled }}
            aria-selected={active}
            aria-disabled={option.disabled}
            accessibilityLabel={option.label}
            disabled={option.disabled}
            onPress={() => onChange(option.value)}
            // Com o respiro de 4 do trilho, a área de toque chega a 44.
            hitSlop={{ top: 4, bottom: 4 }}
            style={{
              flex: 1,
              minHeight: layout.controlHeightSm - 8,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
              borderRadius: radius.pill,
              backgroundColor: active ? colors.surface : 'transparent',
              opacity: option.disabled ? 0.35 : 1,
              ...(active ? elevation(1, dark) : null),
            }}
          >
            <AppText variant="label" color={active ? tint : colors.textMuted} numberOfLines={1} style={{ fontSize: 14, fontWeight: active ? '800' : '700' }}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
