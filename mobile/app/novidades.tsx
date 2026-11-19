import { View } from 'react-native';
import type { ChangeKind, Release } from '../scripts/lib/changelog';
import changelog from '../src/data/changelog.json';
import { APP_VERSION } from '../src/lib/constants';
import { formatDate } from '../src/lib/format';
import { openExternal, REPO_LINKS } from '../src/lib/links';
import { useTheme } from '../src/theme/ThemeProvider';
import { AppText } from '../src/ui/AppText';
import { Badge } from '../src/ui/Badge';
import { Button } from '../src/ui/Button';
import { Card } from '../src/ui/Card';
import type { IconName } from '../src/ui/IconTile';
import { Screen } from '../src/ui/Screen';

// Gerado por scripts/build-changelog.mjs a partir do CHANGELOG.md (um teste confere que está atualizado).
const RELEASES = changelog as Release[];

const KIND_ICONS: Record<ChangeKind, IconName> = {
  Adicionado: 'add-circle-outline',
  Alterado: 'swap-horizontal-outline',
  Corrigido: 'build-outline',
  Removido: 'remove-circle-outline',
  Segurança: 'shield-checkmark-outline',
};

export default function ReleaseNotesScreen() {
  const { colors } = useTheme();

  return (
    <Screen back title="Novidades" subtitle={`Você está na versão ${APP_VERSION}`}>
      {RELEASES.map((release) => {
        const current = release.version === APP_VERSION;
        return (
          <Card key={release.version} style={{ gap: 12, borderColor: current ? colors.primary : colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <AppText variant="heading" accessibilityRole="header">
                {release.date ? `Versão ${release.version}` : release.version}
              </AppText>
              {current && <Badge label="Esta versão" color={colors.primary} />}
              {release.date && (
                <AppText variant="caption" tone="muted">
                  {formatDate(release.date)}
                </AppText>
              )}
            </View>
            {release.summary && <AppText tone="muted">{release.summary}</AppText>}
            {release.changes.map((group) => (
              <View key={group.kind} style={{ gap: 6 }}>
                <Badge label={group.kind} icon={KIND_ICONS[group.kind]} color={group.kind === 'Segurança' ? colors.success : colors.info} />
                {group.items.map((item) => (
                  <View key={item} style={{ flexDirection: 'row', gap: 8 }}>
                    <AppText color={colors.textSubtle} importantForAccessibility="no" accessibilityElementsHidden>
                      •
                    </AppText>
                    <AppText variant="caption" style={{ flex: 1 }}>
                      {item}
                    </AppText>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        );
      })}
      <Button label="Histórico completo no GitHub" icon="logo-github" variant="ghost" fullWidth onPress={() => void openExternal(REPO_LINKS.changelog)} />
    </Screen>
  );
}
