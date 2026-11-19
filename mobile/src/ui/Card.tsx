import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { elevation } from '../theme/tokens';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  tone?: 'surface' | 'alt' | 'primary';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Card({ children, onPress, style, padded = true, tone = 'surface', accessibilityLabel, accessibilityHint }: CardProps) {
  const { colors, radius, dark } = useTheme();

  const background = tone === 'alt' ? colors.surfaceAlt : tone === 'primary' ? colors.primary : colors.surface;

  const base: ViewStyle = {
    backgroundColor: background,
    borderRadius: radius.lg,
    padding: padded ? 18 : 0,
    ...elevation(tone === 'primary' ? 2 : tone === 'surface' ? 1 : 0, dark),
  };

  if (!onPress) return <View style={[base, style]}>{children}</View>;

  // Cartão com fundo próprio (ex.: aviso amarelo) não troca de cor ao toque — só apaga.
  const neutral = tone === 'surface' && StyleSheet.flatten(style)?.backgroundColor === undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [
        base,
        style,
        // Superfície neutra muda de tom ao toque; cartões coloridos só apagam um pouco.
        pressed && (neutral ? { backgroundColor: colors.surfacePressed } : { opacity: 0.88 }),
      ]}
    >
      {children}
    </Pressable>
  );
}
