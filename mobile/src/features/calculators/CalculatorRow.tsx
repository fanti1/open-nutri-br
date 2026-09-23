import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { LIFE_STAGE_LABELS } from '../../domain/calculators/support/lifeStage';
import type { LifeStage } from '../../domain/calculators/types';
import { catalogIcon, moduleInfo, type CatalogEntry } from '../../domain/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';
import { IconTile } from '../../ui/IconTile';

const STAGE_COLOR_KEY = { crianca: 'child', adulto: 'adult', idoso: 'elderly' } as const;

/** "Adulto · Idoso" em texto pequeno e colorido — informa sem ocupar uma linha de etiquetas. */
export function StageLine({ stages }: { stages: LifeStage[] }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
      {stages.map((stage, index) => (
        <AppText key={stage} variant="small" color={colors[STAGE_COLOR_KEY[stage]]}>
          {index > 0 ? ' · ' : ''}
          {LIFE_STAGE_LABELS[stage]}
        </AppText>
      ))}
    </View>
  );
}

interface CalculatorListItemProps {
  entry: CatalogEntry;
  onPress: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  divider?: boolean;
  /** Mostra a área (útil em resultados de busca, que misturam áreas). */
  showModule?: boolean;
}

/** Linha compacta de calculadora, para listas agrupadas dentro de um cartão. */
export function CalculatorListItem({ entry, onPress, favorite, onToggleFavorite, divider, showModule }: CalculatorListItemProps) {
  const { colors } = useTheme();
  const module = moduleInfo(entry.module);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={entry.name}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <IconTile name={catalogIcon(entry)} size={36} color={module ? colors[module.colorKey] : undefined} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {entry.name}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {showModule && module ? `${module.label} · ` : ''}
          {entry.short_description}
        </AppText>
        <StageLine stages={entry.life_stages} />
      </View>
      {onToggleFavorite ? (
        <Pressable
          accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onPress={onToggleFavorite}
          hitSlop={12}
        >
          <Ionicons name={favorite ? 'star' : 'star-outline'} size={20} color={favorite ? colors.accent : colors.textSubtle} />
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      )}
    </Pressable>
  );
}

/** Várias calculadoras dentro de um único cartão, separadas por linhas finas. */
export function CalculatorGroup({
  entries,
  onOpen,
  favorites,
  onToggleFavorite,
  showModule,
}: {
  entries: CatalogEntry[];
  onOpen: (entry: CatalogEntry) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (entry: CatalogEntry) => void;
  showModule?: boolean;
}) {
  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      {entries.map((entry, index) => (
        <CalculatorListItem
          key={entry.slug}
          entry={entry}
          onPress={() => onOpen(entry)}
          favorite={favorites?.has(entry.slug)}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(entry) : undefined}
          divider={index < entries.length - 1}
          showModule={showModule}
        />
      ))}
    </Card>
  );
}
