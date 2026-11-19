import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fontFor, type Palette, type TypographyVariant } from '../theme/tokens';

type Tone = 'default' | 'muted' | 'subtle' | 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'onPrimary';

const TONE_TO_COLOR: Record<Tone, keyof Palette> = {
  default: 'text',
  muted: 'textMuted',
  subtle: 'textSubtle',
  primary: 'primary',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
  info: 'info',
  onPrimary: 'onPrimary',
};

// Títulos grandes já são grandes: crescem menos com a fonte do sistema para não quebrar o cabeçalho.
const MAX_SCALE: Partial<Record<TypographyVariant, number>> = { display: 1.3, title: 1.35, metric: 1.3 };

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: Tone;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function AppText({ variant = 'body', tone = 'default', color, align, style, maxFontSizeMultiplier, ...props }: AppTextProps) {
  const theme = useTheme();
  const extra = StyleSheet.flatten(style) as TextStyle | undefined;
  // Um peso pedido pela tela vira o arquivo da Nunito daquele peso (o Android não engrossa fonte própria).
  const weight: TextStyle | null = extra?.fontWeight ? { fontFamily: fontFor(extra.fontWeight), fontWeight: 'normal' } : null;

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? MAX_SCALE[variant] ?? 1.6}
      {...props}
      style={[theme.typography[variant], { color: color ?? theme.colors[TONE_TO_COLOR[tone]], textAlign: align }, style, weight]}
    />
  );
}
