import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { LIFE_STAGE_LABELS, LIFE_STAGE_PLURAL, STAGE_COLOR_KEY } from '../../domain/calculators/support/lifeStage';
import type { LifeStage } from '../../domain/calculators/types';
import { catalogIcon, moduleInfo, type CatalogEntry } from '../../domain/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';
import { IconTile } from '../../ui/IconTile';


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
  /**
   * Como indicar a faixa etária: "all" lista todas (busca, que mistura
   * públicos); "exclusive" só marca métodos exclusivos de uma faixa (dentro de
   * um público já escolhido); "none" omite.
   */
  stages?: 'all' | 'exclusive' | 'none';
}

/** Selo para método validado para uma única faixa (ex.: "Específico para idosos"). */
function ExclusiveBadge({ stage }: { stage: LifeStage }) {
  const { colors } = useTheme();
  const tint = colors[STAGE_COLOR_KEY[stage]];
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${tint}1A`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 }}>
      <Ionicons name="star-half-outline" size={11} color={tint} />
      <AppText variant="small" color={tint}>
        Específico para {LIFE_STAGE_PLURAL[stage]}
      </AppText>
    </View>
  );
}

/** Linha compacta de calculadora, para listas agrupadas dentro de um cartão. */
export function CalculatorListItem({ entry, onPress, favorite, onToggleFavorite, divider, showModule, stages = 'all' }: CalculatorListItemProps) {
  const { colors } = useTheme();
  const module = moduleInfo(entry.module);

  // A estrela fica fora do botão da linha (alvos irmãos): um botão dentro de outro é
  // HTML inválido no navegador e fica inalcançável no VoiceOver.
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: divider ? 1 : 0, borderBottomColor: colors.border }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={entry.name}
        onPress={onPress}
        style={({ pressed }) => ({
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingLeft: 14,
          paddingRight: onToggleFavorite ? 4 : 14,
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
          {stages === 'all' && <StageLine stages={entry.life_stages} />}
          {stages === 'exclusive' && entry.life_stages.length === 1 && <ExclusiveBadge stage={entry.life_stages[0]} />}
        </View>
        {!onToggleFavorite && <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />}
      </Pressable>
      {onToggleFavorite && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorite ? `Remover ${entry.name} dos favoritos` : `Adicionar ${entry.name} aos favoritos`}
          accessibilityState={{ selected: !!favorite }}
          onPress={onToggleFavorite}
          style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: 6, opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name={favorite ? 'star' : 'star-outline'} size={20} color={favorite ? colors.accent : colors.textSubtle} />
        </Pressable>
      )}
    </View>
  );
}

/** Várias calculadoras dentro de um único cartão, separadas por linhas finas. */
export function CalculatorGroup({
  entries,
  onOpen,
  favorites,
  onToggleFavorite,
  showModule,
  stages,
}: {
  entries: CatalogEntry[];
  onOpen: (entry: CatalogEntry) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (entry: CatalogEntry) => void;
  showModule?: boolean;
  stages?: CalculatorListItemProps['stages'];
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
          stages={stages}
        />
      ))}
    </Card>
  );
}
