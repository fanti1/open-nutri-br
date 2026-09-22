import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  children?: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  /** Botão flutuante (ex.: "+ Novo") posicionado sobre o conteúdo. */
  floating?: ReactNode;
}

/** Estrutura padrão de tela: cabeçalho próprio (igual no celular e no navegador), área segura, rolagem. */
export function Screen({ title, subtitle, back, right, children, scroll = true, footer, floating }: ScreenProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const header = (title || back || right) && (
    <View style={[styles.header, { paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }]}>
      <View style={styles.headerRow}>
        {back && (
          <Pressable
            accessibilityLabel="Voltar"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={12}
            style={[styles.back, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          {title && (
            <AppText variant={back ? 'title' : 'display'} numberOfLines={2}>
              {title}
            </AppText>
          )}
          {subtitle && (
            <AppText variant="caption" tone="muted" style={{ marginTop: 2 }}>
              {subtitle}
            </AppText>
          )}
        </View>
        {right}
      </View>
    </View>
  );

  const contentPadding = { padding: spacing.lg, paddingBottom: spacing.xxl + (floating ? 72 : 0) + insets.bottom, gap: spacing.lg };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {header || <View style={{ height: insets.top }} />}
      {scroll ? (
        <ScrollView contentContainerStyle={contentPadding} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentPadding, { paddingBottom: 0 }]}>{children}</View>
      )}
      {footer && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.md }]}>
          {footer}
        </View>
      )}
      {floating && <View style={[styles.floating, { bottom: insets.bottom + spacing.lg }]}>{floating}</View>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  footer: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', gap: 12 },
  floating: { position: 'absolute', right: 20 },
});
