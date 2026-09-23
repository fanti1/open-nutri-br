import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { LifeStage } from '../../domain/calculators/types';
import { CATALOG, categoriesOf, MODULES, type CatalogEntry } from '../../domain/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';
import { IconTile } from '../../ui/IconTile';
import { CalculatorListItem } from './CalculatorRow';

interface AudienceCatalogProps {
  audience: LifeStage;
  onOpen: (entry: CatalogEntry) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (entry: CatalogEntry) => void;
}

/**
 * O selo "Específico para…" só informa quando o tema mistura métodos
 * exclusivos da faixa com métodos gerais (ex.: IMC do Idoso na Antropometria);
 * num tema todo pediátrico ele seria repetição.
 */
function mixesExclusiveAndShared(entries: CatalogEntry[]): boolean {
  return entries.some((entry) => entry.life_stages.length === 1) && entries.some((entry) => entry.life_stages.length > 1);
}

/** Métodos exclusivos da faixa vêm primeiro dentro de cada tema (ex.: IMC do Idoso antes dos gerais). */
function exclusiveFirst(entries: CatalogEntry[]): CatalogEntry[] {
  return [...entries].sort((a, b) => Number(b.life_stages.length === 1) - Number(a.life_stages.length === 1));
}

/**
 * Só os métodos validados para o público escolhido, separados por área (que
 * abre e fecha) e, dentro dela, por tema.
 */
export function AudienceCatalog({ audience, onOpen, favorites, onToggleFavorite }: AudienceCatalogProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState<Set<string>>(new Set());

  const areas = MODULES.map((module) => ({
    module,
    entries: CATALOG.filter((entry) => entry.module === module.key && entry.life_stages.includes(audience)),
  })).filter((area) => area.entries.length > 0);

  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <View style={{ gap: 10 }}>
      {areas.map(({ module, entries }) => {
        const expanded = open.has(module.key) || areas.length === 1;
        const tint = colors[module.colorKey];
        return (
          <Card key={module.key} padded={false} style={{ overflow: 'hidden' }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              aria-expanded={expanded}
              accessibilityLabel={module.label}
              onPress={() => toggle(module.key)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, opacity: pressed ? 0.8 : 1 })}
            >
              <IconTile name={module.icon} color={tint} size={42} />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="heading">{module.label}</AppText>
                <AppText variant="caption" tone="muted" numberOfLines={1}>
                  {entries.length} {entries.length === 1 ? 'método' : 'métodos'} · {module.description}
                </AppText>
              </View>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSubtle} />
            </Pressable>

            {expanded &&
              categoriesOf(entries).map((group) => (
                <View key={group.category}>
                  <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, backgroundColor: colors.surfaceAlt, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <AppText variant="overline" tone="muted">
                      {group.label}
                    </AppText>
                  </View>
                  {exclusiveFirst(group.entries).map((entry, index, list) => (
                    <CalculatorListItem
                      key={entry.slug}
                      entry={entry}
                      stages={mixesExclusiveAndShared(group.entries) ? 'exclusive' : 'none'}
                      onPress={() => onOpen(entry)}
                      favorite={favorites?.has(entry.slug)}
                      onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(entry) : undefined}
                      divider={index < list.length - 1}
                    />
                  ))}
                </View>
              ))}
          </Card>
        );
      })}
    </View>
  );
}
