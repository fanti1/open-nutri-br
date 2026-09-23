import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { STAGES, stageAgeRangeLabel } from '../../domain/calculatorProfile';
import { LIFE_STAGE_SHORT_LABELS, STAGE_COLOR_KEY } from '../../domain/calculators/support/lifeStage';
import type { LifeStage } from '../../domain/calculators/types';
import { CATALOG } from '../../domain/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import type { IconName } from '../../ui/IconTile';

const STAGE_ICONS: Record<LifeStage, IconName> = {
  crianca: 'happy-outline',
  adulto: 'person-outline',
  idoso: 'accessibility-outline',
};

const SHORT_RANGE: Record<LifeStage, string> = {
  crianca: '0 a 19 anos',
  adulto: '20 a 59 anos',
  idoso: '60 anos ou +',
};

export function audienceCount(stage: LifeStage): number {
  return CATALOG.filter((entry) => entry.life_stages.includes(stage)).length;
}

/** "Para quem é o cálculo?" — três públicos lado a lado, cada um com sua cor. */
export function AudienceSelector({ value, onChange }: { value: LifeStage; onChange: (stage: LifeStage) => void }) {
  const { colors, radius } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="radiogroup">
      {STAGES.map((stage) => {
        const selected = stage === value;
        const tint = colors[STAGE_COLOR_KEY[stage]];
        return (
          <Pressable
            key={stage}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            aria-checked={selected}
            accessibilityLabel={`${LIFE_STAGE_SHORT_LABELS[stage]}, ${stageAgeRangeLabel(stage)}`}
            onPress={() => onChange(stage)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              gap: 4,
              paddingVertical: 14,
              paddingHorizontal: 6,
              borderRadius: radius.lg,
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? tint : colors.border,
              backgroundColor: selected ? `${tint}1A` : colors.surface,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name={STAGE_ICONS[stage]} size={26} color={selected ? tint : colors.textMuted} />
            <AppText variant="bodyStrong" color={selected ? tint : colors.text}>
              {LIFE_STAGE_SHORT_LABELS[stage]}
            </AppText>
            <AppText variant="small" tone="muted">
              {SHORT_RANGE[stage]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
