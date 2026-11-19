import { useFocusEffect, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, type ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { elevation } from '../theme/tokens';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface HeroOptions {
  /** Cor do cabeçalho (padrão: verde da marca). O texto sobre ele é branco, ou `onColor`. */
  color?: string;
  onColor?: string;
  /** Conteúdo extra dentro do cabeçalho, sob o título (ex.: chips de perfil). */
  children?: ReactNode;
  /** Quanto o primeiro bloco do conteúdo sobe sobre o cabeçalho (cartão flutuante). */
  overlap?: number;
}

interface ScreenProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  children?: ReactNode;
  /**
   * false: o conteúdo ocupa a área e cuida da própria rolagem e do respiro —
   * para listas virtualizadas (FlatList), que só desenham o que está na tela.
   */
  scroll?: boolean;
  /** Barra fixa no rodapé (ações principais, resumo do resultado). */
  footer?: ReactNode;
  /** Botão flutuante (ex.: "+ Novo") posicionado sobre o conteúdo. */
  floating?: ReactNode;
  /** Cabeçalho colorido de cantos arredondados, que rola junto com o conteúdo. */
  hero?: HeroOptions;
}

/**
 * Estrutura padrão de tela: cabeçalho próprio (igual no celular e no navegador),
 * área segura, rolagem. No navegador e em tablets o conteúdo fica numa coluna
 * centralizada de largura confortável de leitura.
 */
export function Screen({ title, subtitle, back, right, children, scroll = true, footer, floating, hero }: ScreenProps) {
  const { colors, spacing, layout, dark, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const column = { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' } as const;
  const heroColor = hero?.color ?? colors.hero;
  const onHero = hero?.onColor ?? colors.onHero;
  const lightIcons = !!hero && onHero.toUpperCase() === '#FFFFFF';

  // Com cabeçalho colorido, os ícones da barra de status ficam claros enquanto a tela está em foco.
  useFocusEffect(
    useCallback(() => {
      if (!hero) return undefined;
      setStatusBarStyle(lightIcons ? 'light' : 'dark');
      return () => setStatusBarStyle(dark ? 'light' : 'dark');
    }, [hero, lightIcons, dark]),
  );

  const titleBlock = (title || subtitle) && (
    <View style={{ flex: 1 }}>
      {title && (
        <AppText variant={back ? 'title' : 'display'} numberOfLines={2} accessibilityRole="header" color={hero ? onHero : undefined}>
          {title}
        </AppText>
      )}
      {subtitle && (
        <AppText variant="caption" tone="muted" color={hero ? onHero : undefined} style={{ marginTop: 2, opacity: hero ? 0.9 : 1 }} numberOfLines={2}>
          {subtitle}
        </AppText>
      )}
    </View>
  );

  const backButton = back && (
    <IconButton
      icon="chevron-back"
      label="Voltar"
      variant={hero ? 'onHero' : 'filled'}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );

  if (hero) {
    const overlap = hero.overlap ?? 0;
    const heroBlock = (
      <View
        style={{
          backgroundColor: heroColor,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.xl + overlap,
          borderBottomLeftRadius: radius.xl + 4,
          borderBottomRightRadius: radius.xl + 4,
          overflow: 'hidden',
        }}
      >
        {/* Círculo decorativo: dá profundidade ao bloco de cor sem disputar com o texto. */}
        <View pointerEvents="none" style={[styles.blob, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        <View style={[column, { paddingHorizontal: spacing.lg, gap: spacing.lg }]}>
          <View style={styles.headerRow}>
            {backButton}
            {titleBlock}
            {right}
          </View>
          {hero.children}
        </View>
      </View>
    );

    // Lista virtualizada: o cabeçalho colorido fica fixo e a lista rola abaixo dele.
    if (!scroll) {
      return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior="padding">
          {heroBlock}
          <View style={[{ flex: 1, marginTop: -overlap }, column]}>{children}</View>
          {footer && <Footer column={column}>{footer}</Footer>}
          {floating && <View style={[styles.floating, { bottom: insets.bottom + spacing.lg }]}>{floating}</View>}
        </KeyboardAvoidingView>
      );
    }

    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: (footer ? 0 : insets.bottom) + spacing.xxl + (floating ? 76 : 0) }}>
          {heroBlock}
          <View style={[column, { paddingHorizontal: spacing.lg, gap: spacing.lg, marginTop: -overlap, paddingTop: overlap ? 0 : spacing.lg }]}>{children}</View>
        </ScrollView>
        {footer && <Footer column={column}>{footer}</Footer>}
        {floating && <View style={[styles.floating, { bottom: insets.bottom + spacing.lg }]}>{floating}</View>}
      </KeyboardAvoidingView>
    );
  }

  const header = (title || back || right) && (
    <View style={[styles.header, { paddingTop: insets.top + (back ? spacing.sm : spacing.lg) }]}>
      {/* O respiro lateral fica dentro da coluna: título e conteúdo começam na mesma linha vertical. */}
      <View style={[styles.headerRow, column, { paddingHorizontal: back ? spacing.md : spacing.lg }]}>
        {backButton}
        {titleBlock}
        {right}
      </View>
    </View>
  );

  const contentPadding = { padding: spacing.lg, paddingBottom: spacing.xxl + (floating ? 76 : 0) + (footer ? 0 : insets.bottom), gap: spacing.lg };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior="padding">
      {header || <View style={{ height: insets.top }} />}
      {scroll ? (
        <ScrollView contentContainerStyle={[contentPadding, column]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, column]}>{children}</View>
      )}
      {footer && <Footer column={column}>{footer}</Footer>}
      {floating && <View style={[styles.floating, { bottom: insets.bottom + spacing.lg }]}>{floating}</View>}
    </KeyboardAvoidingView>
  );
}

/** Barra fixa no rodapé, com cantos superiores arredondados e sombra para cima. */
function Footer({ children, column }: { children: ReactNode; column: object }) {
  const { colors, spacing, dark, radius } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: colors.surface,
          paddingBottom: insets.bottom + spacing.md,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          borderTopWidth: dark ? StyleSheet.hairlineWidth : 0,
          borderTopColor: colors.border,
        },
        elevation(3, dark),
        { shadowOffset: { width: 0, height: -6 }, shadowOpacity: dark ? 0 : 0.08 },
      ]}
    >
      <View style={[styles.footerRow, column]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footer: { paddingTop: 14 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  floating: { position: 'absolute', right: 20 },
  blob: { position: 'absolute', width: 240, height: 240, borderRadius: 120, right: -70, top: -90 },
});
