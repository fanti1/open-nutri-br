import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { useTheme } from '../theme/ThemeProvider';
import { darkPalette, lightPalette } from '../theme/tokens';
import { AppText } from './AppText';

interface ToastState {
  message: string | null;
  tone: 'success' | 'error';
  show: (message: string, tone?: 'success' | 'error') => void;
  hide: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  message: null,
  tone: 'success',
  show: (message, tone = 'success') => set({ message, tone }),
  hide: () => set({ message: null }),
}));

/** Mostra um aviso curto no rodapé (ex.: "Paciente salvo"). */
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
};

export function ToastHost() {
  const { message, tone, hide } = useToastStore();
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    // No Android a região viva anuncia; o VoiceOver (iOS) ignora regiões vivas e precisa do anúncio explícito.
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
    const timer = setTimeout(hide, 2600);
    return () => clearTimeout(timer);
  }, [message, hide]);

  if (!message) return null;

  // O aviso usa as cores invertidas do tema; o ícone usa a cor do tema oposto para manter o contraste.
  const inverse = dark ? lightPalette : darkPalette;
  const color = tone === 'success' ? inverse.success : inverse.danger;

  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 90 }]}>
      <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.toast, { backgroundColor: colors.text }]}>
        <Ionicons name={tone === 'success' ? 'checkmark-circle' : 'alert-circle'} size={20} color={color} />
        <AppText variant="bodyStrong" color={colors.background} style={{ flexShrink: 1 }}>
          {message}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999, maxWidth: '90%' },
});
