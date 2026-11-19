import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Texto para o leitor de tela quando o rótulo visível não basta. */
  accessibilityLabel?: string;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', icon, loading, disabled, fullWidth, style, accessibilityLabel }: ButtonProps) {
  const { colors, radius, layout } = useTheme();

  const palette = {
    primary: { bg: colors.primary, pressed: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: colors.primarySoft, pressed: colors.surfacePressed, fg: colors.primary, border: colors.primarySoft },
    ghost: { bg: 'transparent', pressed: colors.surfacePressed, fg: colors.primary, border: 'transparent' },
    danger: { bg: colors.dangerSoft, pressed: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
  }[variant];

  const inactive = disabled || loading;
  const md = size === 'md';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? palette.pressed : palette.bg,
          borderColor: palette.border,
          borderRadius: radius.md,
          minHeight: md ? layout.controlHeight : layout.controlHeightSm,
          paddingHorizontal: md ? 20 : 14,
          // Desabilitado fica apagado; o primário pressionado escurece levemente.
          opacity: inactive ? 0.45 : pressed && (variant === 'primary' || variant === 'danger') ? 0.86 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={md ? 19 : 17} color={palette.fg} />}
          <AppText variant={md ? 'bodyStrong' : 'label'} color={palette.fg} numberOfLines={1} style={md ? { fontSize: 16 } : { fontSize: 14 }}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
});
