import { useLocalSearchParams, useRouter } from 'expo-router';
import { helpArticle } from '../../src/domain/help/search';
import { HelpArticleView } from '../../src/features/help/HelpArticleView';
import { openExternal, REPO_LINKS } from '../../src/lib/links';
import { Button } from '../../src/ui/Button';
import { EmptyState } from '../../src/ui/EmptyState';
import { Screen } from '../../src/ui/Screen';

export default function HelpArticleScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = helpArticle(slug);

  if (!article) {
    return (
      <Screen back title="Central de ajuda">
        <EmptyState icon="document-text-outline" title="Guia não encontrado" actionLabel="Ver todos os guias" actionIcon="list" onAction={() => router.replace('/ajuda')} />
      </Screen>
    );
  }

  return (
    <Screen back title={article.title} subtitle={article.summary}>
      <HelpArticleView article={article} />
      <Button label="Ainda com dúvida? Fale com o projeto" icon="chatbubble-ellipses-outline" variant="secondary" fullWidth onPress={() => router.push('/relatar?tipo=sugestao')} />
      <Button label="Ver os guias no GitHub" icon="logo-github" variant="ghost" fullWidth onPress={() => void openExternal(REPO_LINKS.guide)} />
    </Screen>
  );
}
