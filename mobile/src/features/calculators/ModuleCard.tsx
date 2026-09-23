import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import type { ModuleInfo } from '../../domain/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';
import { IconTile } from '../../ui/IconTile';

/** Cartão de uma área (Consultório, Hospitalar…) na entrada das calculadoras. */
export function ModuleCard({ module, count, onPress }: { module: ModuleInfo; count: number; onPress: () => void }) {
  const { colors } = useTheme();
  const tint = colors[module.colorKey];

  return (
    <Card onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <IconTile name={module.icon} color={tint} size={48} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="heading">{module.label}</AppText>
        <AppText variant="caption" tone="muted" numberOfLines={2}>
          {module.description}
        </AppText>
        <AppText variant="small" color={tint} style={{ marginTop: 2 }}>
          {count} {count === 1 ? 'método' : 'métodos'}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
    </Card>
  );
}
