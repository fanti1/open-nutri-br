import { View } from 'react-native';
import type { LifeStage } from '../../domain/calculators/types';
import { CATALOG, categoriesOf, MODULES, type CatalogEntry } from '../../domain/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { areaColors } from '../../theme/tokens';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';
import { AreaGrid, AreaTile } from './AreaTile';
import { CalculatorListItem } from './CalculatorRow';

interface AudienceCatalogProps {
  audience: LifeStage;
  /** Área aberta (null = nenhuma; só a grade aparece). */
  area: string | null;
  onAreaChange: (area: string | null) => void;
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
 * Só os métodos validados para o público escolhido: as áreas em blocos coloridos
 * e, abaixo, os métodos da área escolhida separados por tema.
 */
export function AudienceCatalog({ audience, area, onAreaChange, onOpen, favorites, onToggleFavorite }: AudienceCatalogProps) {
  const { colors } = useTheme();

  const areas = MODULES.map((module) => ({
    module,
    entries: CATALOG.filter((entry) => entry.module === module.key && entry.life_stages.includes(audience)),
  })).filter((item) => item.entries.length > 0);

  const selected = areas.find((item) => item.module.key === area) ?? (areas.length === 1 ? areas[0] : undefined);

  return (
    <View style={{ gap: 18 }}>
      <View accessibilityRole="radiogroup" accessibilityLabel="Área">
        <AreaGrid>
          {areas.map(({ module, entries }) => (
            <AreaTile
              key={module.key}
              module={module}
              count={entries.length}
              selected={selected?.module.key === module.key}
              onPress={() => onAreaChange(selected?.module.key === module.key ? null : module.key)}
            />
          ))}
        </AreaGrid>
      </View>

      {selected ? (
        <View style={{ gap: 16 }}>
          <AppText variant="title" style={{ fontSize: 20 }} accessibilityRole="header">
            {selected.module.label}
          </AppText>
          {categoriesOf(selected.entries).map((group) => (
            <View key={group.category} style={{ gap: 8 }}>
              <AppText variant="overline" color={areaColors(colors, selected.module.colorKey).text} accessibilityRole="header">
                {group.label}
              </AppText>
              <Card padded={false} style={{ overflow: 'hidden' }}>
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
              </Card>
            </View>
          ))}
        </View>
      ) : (
        <AppText variant="caption" tone="muted" align="center">
          Escolha uma área para ver os métodos.
        </AppText>
      )}
    </View>
  );
}
