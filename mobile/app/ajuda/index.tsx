import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { HELP_ARTICLES, searchCalculators, searchHelp } from '../../src/domain/help/search';
import { CalculatorGroup } from '../../src/features/calculators/CalculatorRow';
import { AppText } from '../../src/ui/AppText';
import { Callout } from '../../src/ui/Callout';
import { Card } from '../../src/ui/Card';
import { EmptyState } from '../../src/ui/EmptyState';
import { IconTile, type IconName } from '../../src/ui/IconTile';
import { ListItem } from '../../src/ui/ListItem';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';
import { TextField } from '../../src/ui/TextField';

const ICONS: Record<string, IconName> = {
  'primeiros-passos': 'rocket-outline',
  calculadoras: 'calculator-outline',
  pacientes: 'people-outline',
  'plano-alimentar': 'restaurant-outline',
  'agenda-e-tarefas': 'calendar-outline',
  'backup-e-seguranca': 'cloud-upload-outline',
  privacidade: 'shield-checkmark-outline',
  acessibilidade: 'accessibility-outline',
  'perguntas-frequentes': 'help-circle-outline',
};

/** Guias de uso dentro do app, com busca: funciona sem internet e sempre cita a tela certa. */
export default function HelpScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;
  const hits = searching ? searchHelp(query) : [];
  const calculators = searching ? searchCalculators(query).slice(0, 5) : [];

  return (
    <Screen back title="Central de ajuda" subtitle="Guias de uso, sem precisar de internet">
      <TextField value={query} onChangeText={setQuery} placeholder="Ex.: como faço backup, esqueci o PIN, IMC idoso" icon="search" clearable />

      {searching ? (
        <View style={{ gap: 16 }} accessibilityLiveRegion="polite">
          <AppText variant="small" tone="subtle" accessibilityRole="summary">
            {hits.length + calculators.length === 0
              ? 'Nenhum resultado'
              : `${hits.length} ${hits.length === 1 ? 'guia' : 'guias'} e ${calculators.length} ${calculators.length === 1 ? 'calculadora' : 'calculadoras'}`}
          </AppText>
          {hits.length > 0 && (
            <Section title="Guias">
              <Card padded={false} style={{ paddingHorizontal: 16 }}>
                {hits.map((hit, index) => (
                  <ListItem
                    key={hit.article.slug}
                    title={hit.section ? `${hit.article.title} › ${hit.section}` : hit.article.title}
                    subtitle={hit.snippet}
                    left={<IconTile name={ICONS[hit.article.slug] ?? 'document-text-outline'} size={36} />}
                    onPress={() => router.push({ pathname: '/ajuda/[slug]', params: { slug: hit.article.slug } })}
                    divider={index < hits.length - 1}
                  />
                ))}
              </Card>
            </Section>
          )}
          {calculators.length > 0 && (
            <Section title="Calculadoras">
              <CalculatorGroup entries={calculators} onOpen={(entry) => router.push(`/calculadora/${entry.slug}`)} showModule stages="all" />
            </Section>
          )}
          {hits.length + calculators.length === 0 && (
            <EmptyState
              icon="search-outline"
              title="Nada encontrado"
              message="Tente outras palavras ou conte sua dúvida: ela pode virar um guia novo."
              actionLabel="Enviar a dúvida"
              actionIcon="chatbubble-ellipses-outline"
              onAction={() => router.push('/relatar?tipo=sugestao')}
            />
          )}
        </View>
      ) : (
        <>
          <Section title="Guias">
            <Card padded={false} style={{ paddingHorizontal: 16 }}>
              {HELP_ARTICLES.map((article, index) => (
                <ListItem
                  key={article.slug}
                  title={article.title}
                  subtitle={article.summary}
                  left={<IconTile name={ICONS[article.slug] ?? 'document-text-outline'} size={36} />}
                  onPress={() => router.push({ pathname: '/ajuda/[slug]', params: { slug: article.slug } })}
                  divider={index < HELP_ARTICLES.length - 1}
                />
              ))}
            </Card>
          </Section>
          <Callout tone="neutral" title="Não achou o que procurava?" actionLabel="Relatar um problema ou sugerir" onPress={() => router.push('/relatar')}>
            Conte sua dúvida ou o problema. As respostas mais pedidas viram guias novos.
          </Callout>
        </>
      )}
    </Screen>
  );
}
