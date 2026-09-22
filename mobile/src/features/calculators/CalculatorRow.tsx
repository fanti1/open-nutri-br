import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { catalogIcon, type CatalogEntry } from '../../domain/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';
import { IconTile } from '../../ui/IconTile';
import { LifeStageBadges } from '../common/LifeStageBadge';

interface CalculatorRowProps {
  entry: CatalogEntry;
  favorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function CalculatorRow({ entry, favorite, onPress, onToggleFavorite }: CalculatorRowProps) {
  const { colors } = useTheme();

  return (
    <Card onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <IconTile name={catalogIcon(entry)} />
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="bodyStrong">{entry.name}</AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {entry.short_description}
        </AppText>
        <LifeStageBadges stages={entry.life_stages} />
      </View>
      <Pressable
        accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        onPress={onToggleFavorite}
        hitSlop={12}
      >
        <Ionicons name={favorite ? 'star' : 'star-outline'} size={22} color={favorite ? colors.accent : colors.textSubtle} />
      </Pressable>
    </Card>
  );
}

/** Versão compacta para o "Acesso rápido" do Início. */
export function CalculatorTile({ entry, onPress }: { entry: CatalogEntry; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={{ width: 150, gap: 10 }}>
      <IconTile name={catalogIcon(entry)} size={36} />
      <View style={{ gap: 2 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {entry.name}
        </AppText>
        <AppText variant="small" tone="muted" numberOfLines={2}>
          {entry.short_description}
        </AppText>
      </View>
    </Card>
  );
}
