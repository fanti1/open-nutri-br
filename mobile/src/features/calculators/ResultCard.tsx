import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { classificationTone } from '../../domain/catalog';
import type { CalculationOutcome } from '../../domain/calculators/types';
import { classificationLabel, fieldLabel, formatFieldValue } from '../../domain/forms/fieldLabels';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';
import type { IconName } from '../../ui/IconTile';

type Outcome = Pick<CalculationOutcome, 'values' | 'classification'>;

const TONE_ICON: Record<ReturnType<typeof classificationTone>, IconName> = {
  success: 'checkmark-circle',
  warning: 'alert-circle',
  danger: 'warning',
  info: 'information-circle',
};

/** Cor da classificação (verde/amarelo/vermelho/azul) — a mesma no cartão e na barra fixa. */
function useClassificationColors(classification: Outcome['classification']) {
  const { colors } = useTheme();
  const tone = classificationTone(classification);
  return {
    tone,
    fg: { success: colors.success, warning: colors.warning, danger: colors.danger, info: colors.info }[tone],
    bg: { success: colors.successSoft, warning: colors.warningSoft, danger: colors.dangerSoft, info: colors.infoSoft }[tone],
  };
}

/**
 * Classificação em pílula com ícone: o significado não depende só da cor.
 * `solid`: pílula cheia na cor da classificação, para ficar sobre o fundo suave do cartão de resultado.
 */
export function ClassificationPill({ classification, compact, solid }: { classification: string; compact?: boolean; solid?: boolean }) {
  const { colors } = useTheme();
  const { tone, fg: toneColor, bg: toneSoft } = useClassificationColors(classification);
  // Cheia: fundo na cor e texto na cor da superfície (branco no claro, quase preto no escuro) — passa AA nos dois temas.
  const bg = solid ? toneColor : toneSoft;
  const fg = solid ? colors.surface : toneColor;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        backgroundColor: bg,
        borderRadius: 999,
        paddingHorizontal: compact ? 9 : 14,
        paddingVertical: compact ? 3 : 7,
        maxWidth: '100%',
      }}
    >
      <Ionicons name={TONE_ICON[tone]} size={compact ? 13 : 16} color={fg} />
      <AppText variant={compact ? 'small' : 'bodyStrong'} color={fg} numberOfLines={compact ? 1 : 3} style={{ flexShrink: 1, fontWeight: '800' }}>
        {classificationLabel(classification)}
      </AppText>
    </View>
  );
}

/** Resultado em destaque: valor principal grande, classificação colorida e valores secundários. */
export function ResultCard({ outcome }: { outcome: Outcome }) {
  const { colors, radius } = useTheme();
  const { bg } = useClassificationColors(outcome.classification);
  const [main, ...rest] = Object.entries(outcome.values);

  return (
    <Card style={{ gap: 14 }}>
      {/* Bloco do valor principal no tom suave da classificação: o resultado se lê de longe. */}
      <View style={{ backgroundColor: outcome.classification ? bg : colors.surfaceAlt, borderRadius: radius.md, padding: 16, gap: 10 }}>
        {main && (
          <View accessible accessibilityLabel={`${fieldLabel(main[0])}: ${formatFieldValue(main[0], main[1])}`}>
            <AppText variant="overline" tone="muted">
              {fieldLabel(main[0])}
            </AppText>
            <AppText variant="metric" selectable style={{ fontSize: 44, lineHeight: 50 }}>
              {formatFieldValue(main[0], main[1])}
            </AppText>
          </View>
        )}
        {outcome.classification && <ClassificationPill classification={outcome.classification} solid />}
      </View>

      {rest.length > 0 && (
        <View>
          {rest.map(([key, value], index) => (
            <View
              key={key}
              accessible
              accessibilityLabel={`${fieldLabel(key)}: ${formatFieldValue(key, value)}`}
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                paddingVertical: 8,
                borderTopWidth: index ? 1 : 0,
                borderTopColor: colors.border,
              }}
            >
              <AppText variant="caption" tone="muted" style={{ flex: 1 }}>
                {fieldLabel(key)}
              </AppText>
              <AppText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }} selectable>
                {formatFieldValue(key, value)}
              </AppText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

/** Versão de uma linha para a barra fixa do rodapé: valor principal + classificação. */
export function ResultSummary({ outcome }: { outcome: Outcome }) {
  const [main] = Object.entries(outcome.values);
  if (!main) return null;

  return (
    <View style={{ flex: 1, gap: 2 }} accessible accessibilityLabel={`Resultado: ${fieldLabel(main[0])} ${formatFieldValue(main[0], main[1])}${outcome.classification ? `, ${classificationLabel(outcome.classification)}` : ''}`}>
      <AppText variant="small" tone="muted" numberOfLines={1}>
        {fieldLabel(main[0])}
      </AppText>
      <AppText variant="heading" numberOfLines={1} style={{ fontVariant: ['tabular-nums'] }}>
        {formatFieldValue(main[0], main[1])}
      </AppText>
      {outcome.classification && <ClassificationPill classification={outcome.classification} compact />}
    </View>
  );
}
