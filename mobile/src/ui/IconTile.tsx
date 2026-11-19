import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { withAlpha } from '../theme/tokens';

export type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Ícone dentro de um quadrado bem arredondado: fundo suave da mesma cor ou,
 * com `fill`, bloco cheio da cor e ícone em `onFill` (branco, por padrão).
 */
export function IconTile({ name, color, size = 40, fill, onFill = '#FFFFFF' }: { name: IconName; color?: string; size?: number; fill?: string; onFill?: string }) {
  const { colors } = useTheme();
  const tint = color ?? colors.primary;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: fill ?? withAlpha(tint, 0.13),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={size * 0.5} color={fill ? onFill : tint} />
    </View>
  );
}
