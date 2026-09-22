import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';

/** Bloco com título (e ação opcional à direita, ex.: "Ver todos"). */
export function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="overline" tone="muted">
          {title}
        </AppText>
        {action && onAction && (
          <Pressable onPress={onAction} hitSlop={8}>
            <AppText variant="caption" tone="primary">
              {action}
            </AppText>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}
