import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export type IconName = keyof typeof Ionicons.glyphMap;

/** Ícone dentro de um quadrado arredondado com fundo suave da mesma cor. */
export function IconTile({ name, color, size = 40 }: { name: IconName; color?: string; size?: number }) {
  const { colors } = useTheme();
  const tint = color ?? colors.primary;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: `${tint}1F`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={size * 0.5} color={tint} />
    </View>
  );
}
