import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { STAGES, stageAgeRangeLabel } from '../../domain/calculatorProfile';
import { LIFE_STAGE_SHORT_LABELS } from '../../domain/calculators/support/lifeStage';
import type { LifeStage } from '../../domain/calculators/types';
import { CATALOG } from '../../domain/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { elevation, type Palette } from '../../theme/tokens';
import { AppText } from '../../ui/AppText';
import type { IconName } from '../../ui/IconTile';

const STAGE_ICONS: Record<LifeStage, IconName> = {
  crianca: 'happy-outline',
  adulto: 'person-outline',
  idoso: 'accessibility-outline',
};

const STAGE_ICONS_ACTIVE: Record<LifeStage, IconName> = {
  crianca: 'happy',
  adulto: 'person',
  idoso: 'accessibility',
};

const SHORT_RANGE: Record<LifeStage, string> = {
  crianca: '0 a 19 anos',
  adulto: '20 a 59 anos',
  idoso: '60 anos ou +',
};

export function audienceCount(stage: LifeStage): number {
  return CATALOG.filter((entry) => entry.life_stages.includes(stage)).length;
}

/** Cor de cada público: blocos cheios com texto que passa AA (amarelo pede texto escuro). */
function stageFill(colors: Palette, stage: LifeStage): { fill: string; onFill: string } {
  if (stage === 'crianca') return { fill: colors.sunFill, onFill: colors.onSun };
  if (stage === 'idoso') return { fill: colors.violetFill, onFill: '#FFFFFF' };
  return { fill: colors.primary, onFill: colors.onPrimary };
}

/** "Para quem é o cálculo?" — três públicos lado a lado; o escolhido vira um bloco cheio da sua cor. */
export function AudienceSelector({ value, onChange }: { value: LifeStage; onChange: (stage: LifeStage) => void }) {
  const { colors, radius, dark } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 10 }} accessibilityRole="radiogroup">
      {STAGES.map((stage) => {
        const selected = stage === value;
        const { fill, onFill } = stageFill(colors, stage);
        return (
          <Pressable
            key={stage}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            aria-checked={selected}
            accessibilityLabel={`${LIFE_STAGE_SHORT_LABELS[stage]}, ${stageAgeRangeLabel(stage)}`}
            onPress={() => onChange(stage)}
            style={({ pressed }) => [
              {
                flex: 1,
                alignItems: 'center',
                gap: 4,
                paddingVertical: 16,
                paddingHorizontal: 6,
                borderRadius: radius.lg,
                backgroundColor: selected ? fill : colors.surface,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
              elevation(selected ? 2 : 1, dark),
            ]}
          >
            <Ionicons name={selected ? STAGE_ICONS_ACTIVE[stage] : STAGE_ICONS[stage]} size={28} color={selected ? onFill : colors.textMuted} />
            <AppText variant="bodyStrong" color={selected ? onFill : colors.text} style={{ fontSize: 16, fontWeight: '800' }}>
              {LIFE_STAGE_SHORT_LABELS[stage]}
            </AppText>
            <AppText variant="small" color={selected ? onFill : colors.textMuted} style={{ opacity: selected ? 0.92 : 1 }}>
              {SHORT_RANGE[stage]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
