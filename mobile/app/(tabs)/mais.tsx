import { useRouter, type Href } from 'expo-router';
import { Pressable } from 'react-native';
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

  const groups: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Organização',
      items: [
        { icon: 'checkbox-outline', title: 'Tarefas', subtitle: 'Checklist com prazos e lembretes', href: '/tarefas', badge: openTasks ? String(openTasks) : undefined },
      ],
    },
    {
      title: 'Consulta',
      items: [
        { icon: 'restaurant-outline', title: 'Planos alimentares', subtitle: 'Plano e recordatório 24 h com a TACO', href: '/planos' },
        { icon: 'nutrition-outline', title: 'Tabela Nutricional', subtitle: 'Composição de alimentos (TACO)', href: '/alimentos' },
        { icon: 'library-outline', title: 'Referências e auditoria', subtitle: 'Fonte e conferência científica de cada calculadora', href: '/referencias' },
      ],
    },
    {
      title: 'Dados',
      items: [
        { icon: 'cloud-upload-outline', title: 'Backup e restauração', subtitle: 'Salvar no Google Drive, iCloud, e-mail…', href: '/backup' },
        { icon: 'lock-closed-outline', title: 'Segurança', subtitle: appSettings?.app_lock ? 'Bloqueio com PIN ativado' : 'Bloquear o app com PIN e digital', href: '/seguranca' },
        { icon: 'shield-checkmark-outline', title: 'Privacidade e LGPD', subtitle: 'Como seus dados são guardados', href: '/privacidade' },
      ],
    },
    {
      title: 'Conta',
      items: [{ icon: 'person-circle-outline', title: 'Perfil profissional', subtitle: appSettings?.profile.name || 'Nome, CRN e especialidade', href: '/perfil' }],
    },
    {
      title: 'Ajuda e sobre',
      items: [
        { icon: 'help-buoy-outline', title: 'Central de ajuda', subtitle: 'Guias de uso e perguntas frequentes, sem internet', href: '/ajuda' },
        { icon: 'chatbubble-ellipses-outline', title: 'Relatar um problema', subtitle: 'Ou sugerir uma melhoria', href: '/relatar' },
        { icon: 'information-circle-outline', title: 'Sobre o OpenNutri BR', subtitle: `Versão ${APP_VERSION} · novidades, código-fonte e licenças`, href: '/sobre' },
      ],
    },
  ];

  return (
    <Screen title="Mais" subtitle="Ferramentas, dados, ajuda e sobre o app" hero={{}}>
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`OpenNutri BR, versão ${APP_VERSION}. Sobre o app`}
        onPress={() => router.push('/sobre')}
        style={({ pressed }) => ({ alignItems: 'center', gap: 4, paddingTop: 8, minHeight: 44, opacity: pressed ? 0.6 : 1 })}
      >
        <AppText variant="bodyStrong" tone="primary">
          OpenNutri BR
        </AppText>
        <AppText variant="small" tone="subtle">
          Versão {APP_VERSION} · código aberto, todas as funcionalidades abertas a todos
        </AppText>
      </Pressable>
    </Screen>
  );
}
