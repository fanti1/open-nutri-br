import { Text, type TextProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Palette, TypographyVariant } from '../theme/tokens';

type Tone = 'default' | 'muted' | 'subtle' | 'primary' | 'danger' | 'success' | 'warning' | 'onPrimary';

const TONE_TO_COLOR: Record<Tone, keyof Palette> = {
  default: 'text',
  muted: 'textMuted',
  subtle: 'textSubtle',
  primary: 'primary',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
  onPrimary: 'onPrimary',
};

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: Tone;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function AppText({ variant = 'body', tone = 'default', color, align, style, ...props }: AppTextProps) {
  const theme = useTheme();

  return (
    <Text
      {...props}
      style={[theme.typography[variant], { color: color ?? theme.colors[TONE_TO_COLOR[tone]], textAlign: align }, style]}
    />
  );
}
