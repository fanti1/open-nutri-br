import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  tone?: 'surface' | 'alt' | 'primary';
}

export function Card({ children, onPress, style, padded = true, tone = 'surface' }: CardProps) {
  const { colors, radius, dark } = useTheme();

  const background = tone === 'alt' ? colors.surfaceAlt : tone === 'primary' ? colors.primary : colors.surface;

  const base: ViewStyle = {
    backgroundColor: background,
    borderRadius: radius.lg,
    borderWidth: tone === 'surface' ? 1 : 0,
    borderColor: colors.border,
    padding: padded ? 16 : 0,
    shadowColor: '#000',
    shadowOpacity: dark ? 0 : 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: dark ? 0 : 1,
  };

  if (!onPress) return <View style={[base, style]}>{children}</View>;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }, style]}>
      {children}
    </Pressable>
  );
}
