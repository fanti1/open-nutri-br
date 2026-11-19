import { useRouter, type Href } from 'expo-router';
import { Image, View } from 'react-native';
import { APP_VERSION } from '../src/lib/constants';
import { abntCitation, AUTHORS, DATA_CREDITS } from '../src/lib/credits';
import { openExternal, REPO_LINKS } from '../src/lib/links';
import { shareText } from '../src/lib/share';
import { useTheme } from '../src/theme/ThemeProvider';
import { AppText } from '../src/ui/AppText';
import { Button } from '../src/ui/Button';
import { Callout } from '../src/ui/Callout';
import { Card } from '../src/ui/Card';
import { IconTile, type IconName } from '../src/ui/IconTile';
import { ListItem } from '../src/ui/ListItem';
import { Screen } from '../src/ui/Screen';
import { Section } from '../src/ui/Section';

interface Row {
  icon: IconName;
  title: string;
  subtitle: string;
  /** Tela do app ou endereço externo (abre o navegador). */
  to: Href | { url: string };
}

export default function AboutScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const citation = abntCitation();

  const groups: { title: string; rows: Row[] }[] = [
    {
      title: 'Projeto',
      rows: [
        { icon: 'sparkles-outline', title: 'Novidades', subtitle: `O que mudou em cada versão`, to: '/novidades' },
        { icon: 'logo-github', title: 'Código-fonte no GitHub', subtitle: 'Leia, confira e contribua', to: { url: REPO_LINKS.source } },
        { icon: 'document-text-outline', title: 'Licença GPL-3.0', subtitle: 'Livre para usar, estudar, modificar e redistribuir', to: { url: REPO_LINKS.license } },
        { icon: 'cube-outline', title: 'Licenças de código aberto', subtitle: 'Bibliotecas que o app usa', to: '/licencas' },
      ],
    },
    {
      title: 'Ajuda e contato',
      rows: [
        { icon: 'help-buoy-outline', title: 'Central de ajuda', subtitle: 'Guias de uso, sem internet', to: '/ajuda' },
        { icon: 'bug-outline', title: 'Relatar um problema', subtitle: 'Abre o GitHub com o relato preenchido', to: '/relatar' },
        { icon: 'bulb-outline', title: 'Sugerir uma melhoria', subtitle: 'Ideias que facilitam o seu dia a dia', to: '/relatar?tipo=sugestao' },
        { icon: 'flask-outline', title: 'Apontar divergência científica', subtitle: 'Um cálculo não bate com a fonte', to: '/relatar?tipo=divergencia' },
        { icon: 'shield-outline', title: 'Falha de segurança', subtitle: 'Relato privado, fora das issues públicas', to: { url: REPO_LINKS.security } },
      ],
    },
  ];

  const open = (to: Row['to']) => (typeof to === 'object' && 'url' in to ? void openExternal(to.url) : router.push(to));

  return (
    <Screen
      back
      title="Sobre"
      hero={{
        overlap: 0,
        children: (
          <View style={{ alignItems: 'center', gap: 8, paddingBottom: 4 }}>
            <Image
              source={require('../assets/icon.png')}
              style={{ width: 92, height: 92, borderRadius: radius.xl }}
              accessibilityIgnoresInvertColors
              accessible={false}
            />
            <AppText variant="display" color={colors.onHero} accessibilityRole="header">
              OpenNutri BR
            </AppText>
            <AppText color={colors.onHero} align="center" style={{ opacity: 0.92 }}>
              Ferramentas clínicas para nutricionistas, abertas a todos
            </AppText>
            {/* Selos em pílulas claras sobre o verde: texto escuro da marca, contraste AA. */}
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[`Versão ${APP_VERSION}`, 'Código aberto', '100% offline'].map((label) => (
                <View key={label} style={{ backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <AppText variant="small" tone="primary" style={{ fontWeight: '800' }}>
                    {label}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ),
      }}
    >
      {groups.map((group) => (
        <Section key={group.title} title={group.title}>
          <Card padded={false} style={{ paddingHorizontal: 16 }}>
            {group.rows.map((row, index) => (
              <ListItem
                key={row.title}
                title={row.title}
                subtitle={row.subtitle}
                left={<IconTile name={row.icon} size={36} />}
                external={typeof row.to === 'object' && 'url' in row.to}
                onPress={() => open(row.to)}
                divider={index < group.rows.length - 1}
              />
            ))}
          </Card>
        </Section>
      ))}

      <Section title="Créditos e fontes de dados">
        <Card style={{ gap: 12 }}>
          {DATA_CREDITS.map((credit) => (
            <View key={credit.title} style={{ gap: 2 }}>
              <AppText variant="bodyStrong">{credit.title}</AppText>
              <AppText variant="caption" tone="muted">
                {credit.detail}
              </AppText>
              <Button label="Abrir a fonte" icon="open-outline" variant="ghost" size="sm" onPress={() => void openExternal(credit.url)} accessibilityLabel={`Abrir a fonte: ${credit.title}`} style={{ alignSelf: 'flex-start' }} />
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Como citar" description="Referência no formato ABNT para trabalhos e artigos">
        <Card tone="alt" style={{ gap: 10 }}>
          <AppText variant="caption" selectable>
            {citation}
          </AppText>
          <Button label="Copiar ou compartilhar a referência" icon="share-outline" variant="secondary" size="sm" onPress={() => void shareText(citation)} />
        </Card>
      </Section>

      <Callout tone="neutral" title="Aviso clínico">
        As calculadoras apoiam a decisão do nutricionista e não substituem a avaliação e o julgamento clínico. Confira sempre os dados de entrada.
      </Callout>

      <AppText variant="small" tone="subtle" align="center">
        © 2026 {AUTHORS} · GPL-3.0-or-later{'\n'}Sem anúncios, sem conta, sem rastreamento.
      </AppText>
    </Screen>
  );
}
