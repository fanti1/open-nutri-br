import { useRouter, type Href } from 'expo-router';
import { View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useSettings } from '../../src/data/hooks';
import type { ThemePreference } from '../../src/data/repositories/settings';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { APP_VERSION } from '../../src/lib/constants';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Badge } from '../../src/ui/Badge';
import { Card } from '../../src/ui/Card';
import { Segmented } from '../../src/ui/Chips';
import { IconTile, type IconName } from '../../src/ui/IconTile';
import { ListItem } from '../../src/ui/ListItem';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';

interface MenuItem {
  icon: IconName;
  title: string;
  subtitle: string;
  href: Href;
  badge?: string;
}

export default function MoreScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { tasks, settings } = useData();
  const { data: appSettings } = useSettings();
  const { data: openTasks = 0 } = useLiveQuery(['tasks'], () => tasks.countOpen());

  const groups: Array<{ title: string; items: MenuItem[] }> = [
    {
      title: 'Organização',
      items: [
        { icon: 'checkbox-outline', title: 'Tarefas', subtitle: 'Checklist com prazos e lembretes', href: '/tarefas', badge: openTasks ? String(openTasks) : undefined },
      ],
    },
    {
      title: 'Consulta',
      items: [
        { icon: 'nutrition-outline', title: 'Tabela Nutricional', subtitle: 'Composição de alimentos (TACO)', href: '/alimentos' },
        { icon: 'library-outline', title: 'Referências científicas', subtitle: 'Método e publicação de cada calculadora', href: '/referencias' },
      ],
    },
    {
      title: 'Dados',
      items: [
        { icon: 'cloud-upload-outline', title: 'Backup e restauração', subtitle: 'Salvar no Google Drive, iCloud, e-mail…', href: '/backup' },
        { icon: 'shield-checkmark-outline', title: 'Privacidade e LGPD', subtitle: 'Como seus dados são guardados', href: '/privacidade' },
      ],
    },
    {
      title: 'Conta',
      items: [{ icon: 'person-circle-outline', title: 'Perfil profissional', subtitle: appSettings?.profile.name || 'Nome, CRN e especialidade', href: '/perfil' }],
    },
  ];

  return (
    <Screen title="Mais">
      {groups.map((group) => (
        <Section key={group.title} title={group.title}>
          <Card padded={false} style={{ paddingHorizontal: 16 }}>
            {group.items.map((item, index) => (
              <ListItem
                key={item.title}
                title={item.title}
                subtitle={item.subtitle}
                left={<IconTile name={item.icon} size={38} />}
                right={item.badge ? <Badge label={item.badge} color={colors.accent} /> : undefined}
                onPress={() => router.push(item.href)}
                divider={index < group.items.length - 1}
              />
            ))}
          </Card>
        </Section>
      ))}

      <Section title="Aparência">
        <Segmented<ThemePreference>
          options={[
            { value: 'system', label: 'Automático' },
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Escuro' },
          ]}
          value={appSettings?.theme ?? 'system'}
          onChange={(theme) => settings.set('theme', theme)}
        />
      </Section>

      <View style={{ alignItems: 'center', gap: 4, paddingTop: 8 }}>
        <AppText variant="bodyStrong" tone="primary">
          OpenNutri BR
        </AppText>
        <AppText variant="small" tone="subtle">
          Versão {APP_VERSION} · todas as funcionalidades abertas a todos
        </AppText>
      </View>
    </Screen>
  );
}
