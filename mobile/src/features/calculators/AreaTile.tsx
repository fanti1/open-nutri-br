import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import type { ModuleInfo } from '../../domain/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { areaColors, elevation } from '../../theme/tokens';
import { AppText } from '../../ui/AppText';

/** Nome curto da área para o bloco (o completo fica no rótulo do leitor de tela). */
const SHORT_LABELS: Record<string, string> = {
  ambulatorio: 'Consultório',
  hospitalar: 'Hospital e UTI',
  pediatria: 'Pediatria',
  bioquimica: 'Exames',
};

interface AreaTileProps {
  module: ModuleInfo;
  count: number;
  onPress: () => void;
  /** Marcado como escolhido (na aba Calculadoras, a área aberta abaixo). */
  selected?: boolean;
}

/** Bloco colorido de uma área de atuação: ícone, nome curto e número de métodos. */
export function AreaTile({ module, count, onPress, selected }: AreaTileProps) {
  const { colors, radius, dark } = useTheme();
  const area = areaColors(colors, module.colorKey);

  return (
    <Pressable
      accessibilityRole={selected === undefined ? 'button' : 'radio'}
      accessibilityState={selected === undefined ? undefined : { checked: selected }}
      aria-checked={selected}
      accessibilityLabel={`${module.label}, ${count} ${count === 1 ? 'método' : 'métodos'}`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          minHeight: 112,
          borderRadius: radius.lg,
          padding: 14,
          justifyContent: 'space-between',
          backgroundColor: area.fill,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          // Escolhida: anel na cor do texto por cima do bloco (a seleção não depende só do tom).
          borderWidth: 3,
          borderColor: selected ? colors.text : 'transparent',
        },
        elevation(selected ? 2 : 1, dark),
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.24)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={module.icon} size={21} color={area.onFill} />
        </View>
        {selected && <Ionicons name="checkmark-circle" size={22} color={area.onFill} />}
      </View>
      <View>
        <AppText variant="bodyStrong" color={area.onFill} numberOfLines={1} style={{ fontSize: 16, fontWeight: '800' }}>
          {SHORT_LABELS[module.key] ?? module.label}
        </AppText>
        <AppText variant="small" color={area.onFill} style={{ fontWeight: '700', opacity: 0.92 }}>
          {count} {count === 1 ? 'método' : 'métodos'}
        </AppText>
      </View>
    </Pressable>
  );
}

/** Os blocos em grade de duas colunas. */
export function AreaGrid({ children }: { children: React.ReactNode[] }) {
  const rows: React.ReactNode[][] = [];
  for (let index = 0; index < children.length; index += 2) rows.push(children.slice(index, index + 2));
  return (
    <View style={{ gap: 10 }}>
      {rows.map((row, index) => (
        <View key={index} style={{ flexDirection: 'row', gap: 10 }}>
          {row}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}
