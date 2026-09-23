import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
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
}

/** Seleção única em "pílulas" — usada em filtros e em campos de múltipla escolha. */
export function ChipGroup<T extends string>({ options, value, onChange, scroll = false }: ChipGroupProps<T>) {
  const { colors, radius } = useTheme();

  const chips = options.map((option) => {
    const active = option.value === value;
    const tint = option.color ?? colors.primary;

    return (
      <Pressable
        key={option.value}
        accessibilityRole="button"
        accessibilityState={{ selected: active, disabled: option.disabled }}
        aria-selected={active}
        aria-disabled={option.disabled}
        disabled={option.disabled}
        onPress={() => onChange(option.value)}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: active ? tint : colors.border,
          backgroundColor: active ? tint : colors.surface,
          opacity: option.disabled ? 0.4 : 1,
        }}
      >
        <AppText variant="caption" color={active ? colors.onPrimary : colors.text}>
          {option.label}
        </AppText>
      </Pressable>
    );
  });

  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
        {chips}
      </ScrollView>
    );
  }

  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{chips}</View>;
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
  const { colors, radius } = useTheme();

  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 3 }}>
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
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 9,
              borderRadius: radius.md - 3,
              backgroundColor: active ? colors.surface : 'transparent',
              borderWidth: active ? 1 : 0,
              borderColor: active ? tint : 'transparent',
              opacity: option.disabled ? 0.35 : 1,
            }}
          >
            <AppText variant="caption" color={active ? tint : undefined} tone={active ? 'default' : 'muted'} numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
