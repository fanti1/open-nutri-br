import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';

interface SectionProps {
  title: string;
  /** Linha explicativa sob o título. */
  description?: string;
  action?: string;
  onAction?: () => void;
  /** "lg" para blocos principais de uma tela (título maior); padrão para subgrupos. */
  size?: 'md' | 'lg';
  children: ReactNode;
}

/** Bloco com título (e ação opcional à direita, ex.: "Ver todos"). */
export function Section({ title, description, action, onAction, size = 'md', children }: SectionProps) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <AppText variant={size === 'lg' ? 'title' : 'heading'} style={{ flex: 1, fontSize: size === 'lg' ? 20 : 17 }} accessibilityRole="header">
            {title}
          </AppText>
          {action && onAction && (
            <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingVertical: 4 })}>
              <AppText variant="label" tone="primary">
                {action}
              </AppText>
            </Pressable>
          )}
        </View>
        {description && (
          <AppText variant="caption" tone="muted">
            {description}
          </AppText>
        )}
      </View>
      {children}
    </View>
  );
}
