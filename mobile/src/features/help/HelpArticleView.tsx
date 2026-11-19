import { View } from 'react-native';
import type { HelpArticle, HelpBlock } from '../../../scripts/lib/help';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Callout } from '../../ui/Callout';

/** Texto com trechos em **negrito** (a única marcação que os guias levam para o app). */
export function RichText({ text, variant = 'body' }: { text: string; variant?: 'body' | 'caption' }) {
  const parts = text.split(/\*\*/);
  return (
    <AppText variant={variant}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <AppText key={index} variant={variant === 'body' ? 'bodyStrong' : 'label'}>
            {part}
          </AppText>
        ) : (
          part
        ),
      )}
    </AppText>
  );
}

function Block({ block }: { block: HelpBlock }) {
  const { colors } = useTheme();

  switch (block.type) {
    case 'h2':
      return (
        <AppText variant="heading" accessibilityRole="header" style={{ marginTop: 12 }}>
          {block.text}
        </AppText>
      );
    case 'h3':
      return (
        <AppText variant="bodyStrong" accessibilityRole="header" style={{ marginTop: 4 }}>
          {block.text}
        </AppText>
      );
    case 'note':
      return (
        <Callout tone="neutral">
          <RichText text={block.text} variant="caption" />
        </Callout>
      );
    case 'li':
      return (
        <View style={{ flexDirection: 'row', gap: 8, paddingLeft: 4 }}>
          {/* O marcador "•" não é lido; o número de um passo é. */}
          <AppText
            color={colors.primary}
            style={{ minWidth: 16 }}
            importantForAccessibility={block.ordinal === undefined ? 'no' : 'auto'}
            accessibilityElementsHidden={block.ordinal === undefined}
          >
            {block.ordinal !== undefined ? `${block.ordinal}.` : '•'}
          </AppText>
          <View style={{ flex: 1 }}>
            <RichText text={block.text} />
          </View>
        </View>
      );
    default:
      return <RichText text={block.text} />;
  }
}

export function HelpArticleView({ article }: { article: HelpArticle }) {
  return (
    <View style={{ gap: 10 }}>
      {article.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </View>
  );
}
