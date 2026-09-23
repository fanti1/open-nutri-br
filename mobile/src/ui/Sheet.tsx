import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

/**
 * Painel que sobe da parte de baixo da tela (seleções, formulários curtos).
 * Sobe junto com o teclado: no Android com tela de ponta a ponta o sistema não
 * redimensiona mais a janela, e o teclado cobriria o painel inteiro.
 */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel="Fechar" />
      <KeyboardAvoidingView behavior="padding" style={styles.dock} pointerEvents="box-none">
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: insets.bottom + 16, maxHeight: '88%' },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          {title && (
            <AppText variant="heading" style={{ marginBottom: 12 }}>
              {title}
            </AppText>
          )}
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dock: { flex: 1, justifyContent: 'flex-end' },
  panel: { paddingHorizontal: 20, paddingTop: 10, maxWidth: 640, alignSelf: 'center', width: '100%' },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 14 },
});
