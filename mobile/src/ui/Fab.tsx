import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { elevation } from '../theme/tokens';
import { AppText } from './AppText';

/** Botão flutuante de ação principal da tela (ex.: "Novo paciente"). */
export function Fab({ label, onPress, icon = 'add' }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const { colors, dark } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        elevation(3, dark),
        { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Ionicons name={icon} size={22} color={colors.onPrimary} />
      <AppText variant="bodyStrong" tone="onPrimary" maxFontSizeMultiplier={1.3}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 58,
    paddingHorizontal: 22,
    borderRadius: 22,
  },
});
