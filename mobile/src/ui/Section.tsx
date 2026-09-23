import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';

interface SectionProps {
  title: string;
  /** Linha explicativa sob o título. */
  description?: string;
  action?: string;
  onAction?: () => void;
  /** "lg" para blocos principais de uma tela; padrão (sobrelinha) para subgrupos. */
  size?: 'md' | 'lg';
  children: ReactNode;
}

/** Bloco com título (e ação opcional à direita, ex.: "Ver todos"). */
export function Section({ title, description, action, onAction, size = 'md', children }: SectionProps) {
  return (
    <View style={{ gap: size === 'lg' ? 12 : 10 }}>
      <View style={{ gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <AppText variant={size === 'lg' ? 'heading' : 'overline'} tone={size === 'lg' ? 'default' : 'muted'} style={{ flex: 1 }}>
            {title}
          </AppText>
          {action && onAction && (
            <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
              <AppText variant="caption" tone="primary">
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
