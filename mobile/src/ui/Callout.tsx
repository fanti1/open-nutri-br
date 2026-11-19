import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import type { IconName } from './IconTile';

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const DEFAULT_ICON: Record<Tone, IconName> = {
  info: 'information-circle-outline',
  success: 'checkmark-circle-outline',
  warning: 'warning-outline',
  danger: 'alert-circle-outline',
  neutral: 'information-circle-outline',
};

interface CalloutProps {
  tone?: Tone;
  title?: string;
  /** Texto principal; aceita nós para destacar trechos. */
  children?: ReactNode;
  icon?: IconName;
  /** Ação em texto ao pé do aviso (ex.: "Ver a auditoria do método"). */
  actionLabel?: string;
  /** Torna o aviso inteiro tocável. */
  onPress?: () => void;
}

/**
 * Aviso dentro da tela (backup pendente, método fora da faixa, conferência
 * pendente…). Um só componente para todos: mesma forma, mesma leitura.
 */
export function Callout({ tone = 'info', title, children, icon, actionLabel, onPress }: CalloutProps) {
  const { colors, radius } = useTheme();

  const palette = {
    info: { fg: colors.info, bg: colors.infoSoft },
    success: { fg: colors.success, bg: colors.successSoft },
    warning: { fg: colors.warning, bg: colors.warningSoft },
    danger: { fg: colors.danger, bg: colors.dangerSoft },
    neutral: { fg: colors.textMuted, bg: colors.surfaceAlt },
  }[tone];

  const body = (
    <>
      {/* Ícone num círculo da própria cor: o aviso se identifica pela forma, não só pelo fundo. */}
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: palette.fg, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon ?? DEFAULT_ICON[tone]} size={20} color={palette.bg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        {title && (
          <AppText variant="bodyStrong" color={palette.fg}>
            {title}
          </AppText>
        )}
        {typeof children === 'string' ? (
          <AppText variant="caption" color={tone === 'neutral' ? colors.textMuted : colors.text}>
            {children}
          </AppText>
        ) : (
          children
        )}
        {actionLabel && (
          <AppText variant="label" color={palette.fg} style={{ marginTop: 4, textDecorationLine: 'underline' }}>
            {actionLabel}
          </AppText>
        )}
      </View>
      {onPress && !actionLabel && <Ionicons name="chevron-forward" size={18} color={palette.fg} style={{ alignSelf: 'center' }} />}
    </>
  );

  const style = {
    flexDirection: 'row' as const,
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: palette.bg,
  };

  if (!onPress) {
    return (
      <View style={style} accessibilityRole={tone === 'danger' || tone === 'warning' ? 'alert' : undefined}>
        {body}
      </View>
    );
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={[title, typeof children === 'string' ? children : null, actionLabel].filter(Boolean).join('. ')} onPress={onPress} style={({ pressed }) => [style, { opacity: pressed ? 0.8 : 1 }]}>
      {body}
    </Pressable>
  );
}
