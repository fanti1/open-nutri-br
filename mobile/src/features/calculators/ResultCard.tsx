import { View } from 'react-native';
import { classificationTone } from '../../domain/catalog';
import type { CalculationOutcome } from '../../domain/calculators/types';
import { classificationLabel, fieldLabel, formatFieldValue } from '../../domain/forms/fieldLabels';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';

/** Resultado em destaque: valor principal grande, classificação colorida e valores secundários. */
export function ResultCard({ outcome }: { outcome: Pick<CalculationOutcome, 'values' | 'classification'> }) {
  const { colors } = useTheme();
  const entries = Object.entries(outcome.values);
  const [main, ...rest] = entries;

  const tone = classificationTone(outcome.classification);
  const toneColor = { success: colors.success, warning: colors.warning, danger: colors.danger, info: colors.info }[tone];
  const toneSoft = { success: colors.successSoft, warning: colors.warningSoft, danger: colors.dangerSoft, info: colors.infoSoft }[tone];

  return (
    <Card style={{ gap: 14, borderColor: toneColor, borderWidth: 1.5 }}>
      {main && (
        <View>
          <AppText variant="caption" tone="muted">
            {fieldLabel(main[0])}
          </AppText>
          <AppText variant="metric">{formatFieldValue(main[0], main[1])}</AppText>
        </View>
      )}

      {outcome.classification && (
        <View style={{ backgroundColor: toneSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' }}>
          <AppText variant="bodyStrong" color={toneColor}>
            {classificationLabel(outcome.classification)}
          </AppText>
        </View>
      )}

      {rest.length > 0 && (
        <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
          {rest.map(([key, value]) => (
            <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <AppText variant="caption" tone="muted" style={{ flex: 1 }}>
                {fieldLabel(key)}
              </AppText>
              <AppText variant="bodyStrong">{formatFieldValue(key, value)}</AppText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}
