import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

/**
 * Painel que sobe da parte de baixo da tela (seleções, formulários curtos).
 * Sobe junto com o teclado: no Android com tela de ponta a ponta o sistema não
 * redimensiona mais a janela, e o teclado cobriria o painel inteiro.
 */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  return (
    // Na web, sem animação: se o painel fecha junto com uma navegação (ex.: "Editar dados" no menu),
    // a tela fica oculta, a animação de saída nunca termina e o fundo escuro ficava preso por cima.
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion || Platform.OS === 'web' ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {/* Com título, o leitor de tela já tem o botão "Fechar" do painel: o fundo não vira uma segunda parada. */}
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
        onPress={onClose}
        accessible={!title}
        accessibilityRole="button"
        accessibilityLabel="Fechar painel"
      />
      <KeyboardAvoidingView behavior="padding" style={styles.dock} pointerEvents="box-none">
        <View
          accessibilityViewIsModal
          style={[
            styles.panel,
            { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: insets.bottom + 16, maxHeight: '88%' },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          {title ? (
            <View style={styles.titleRow}>
              <AppText variant="heading" accessibilityRole="header" numberOfLines={2} style={{ flex: 1 }}>
                {title}
              </AppText>
              <IconButton icon="close" label="Fechar" variant="filled" size={20} onPress={onClose} />
            </View>
          ) : null}
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dock: { flex: 1, justifyContent: 'flex-end' },
  panel: { paddingHorizontal: 20, paddingTop: 10, maxWidth: 640, alignSelf: 'center', width: '100%' },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
});
