import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ThirdPartyLicense } from '../scripts/lib/licenses';
import licenses from '../src/data/licenses.json';
import { normalizeSearch } from '../src/domain/catalog';
import { openExternal } from '../src/lib/links';
import { useTheme } from '../src/theme/ThemeProvider';
import { AppText } from '../src/ui/AppText';
import { EmptyState } from '../src/ui/EmptyState';
import { ListItem } from '../src/ui/ListItem';
import { Screen } from '../src/ui/Screen';
import { TextField } from '../src/ui/TextField';

// Gerado por scripts/build-licenses.mjs (um teste confere que bate com o package-lock e que toda licença é compatível com a GPL-3.0).
const LICENSES = licenses as ThirdPartyLicense[];

/** Bibliotecas de código aberto que o app usa, cada uma com a sua licença. */
export default function LicensesScreen() {
  const { spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const needle = normalizeSearch(search.trim());
  const shown = needle ? LICENSES.filter((pkg) => normalizeSearch(`${pkg.name} ${pkg.license}`).includes(needle)) : LICENSES;

  return (
    <Screen back title="Licenças de código aberto" subtitle={`${LICENSES.length} bibliotecas, todas compatíveis com a GPL-3.0`} scroll={false}>
      <FlatList
        data={shown}
        keyExtractor={(pkg) => `${pkg.name}@${pkg.version}`}
        initialNumToRender={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl + insets.bottom }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: spacing.md }}>
            <AppText variant="caption" tone="muted">
              O OpenNutri BR é feito sobre o trabalho de muitos projetos abertos. A lista inclui as ferramentas usadas para gerar o app. Toque
              numa biblioteca para ver o código-fonte e o texto da licença.
            </AppText>
            <TextField value={search} onChangeText={setSearch} placeholder="Buscar biblioteca ou licença" icon="search" clearable />
          </View>
        }
        renderItem={({ item, index }) => (
          <ListItem
            title={item.name}
            subtitle={`${item.version} · ${item.license}`}
            onPress={() => void openExternal(item.url)}
            external
            divider={index < shown.length - 1}
          />
        )}
        ListEmptyComponent={<EmptyState icon="search-outline" title="Nenhuma biblioteca encontrada" />}
      />
    </Screen>
  );
}
