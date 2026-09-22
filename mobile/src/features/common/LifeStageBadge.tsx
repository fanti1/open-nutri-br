import { View } from 'react-native';
import { LIFE_STAGE_LABELS } from '../../domain/calculators/support/lifeStage';
import type { LifeStage } from '../../domain/calculators/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Badge } from '../../ui/Badge';

const STAGE_COLOR_KEY = { crianca: 'child', adulto: 'adult', idoso: 'elderly' } as const;

/** Deixa sempre explícito para qual público (criança/adulto/idoso) um paciente ou cálculo é. */
export function LifeStageBadge({ stage }: { stage: LifeStage }) {
  const { colors } = useTheme();
  return <Badge label={LIFE_STAGE_LABELS[stage]} color={colors[STAGE_COLOR_KEY[stage]]} />;
}

export function LifeStageBadges({ stages }: { stages: LifeStage[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {stages.map((stage) => (
        <LifeStageBadge key={stage} stage={stage} />
      ))}
    </View>
  );
}
