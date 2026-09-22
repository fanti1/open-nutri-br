import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
  hint?: string;
  error?: string | null;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

export function TextField({
  label, value, onChangeText, placeholder, unit, hint, error, keyboardType, multiline, icon, autoFocus, onSubmitEditing, autoCapitalize,
}: TextFieldProps) {
  const { colors, radius } = useTheme();

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.box,
          {
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {icon && <Ionicons name={icon} size={18} color={colors.textSubtle} style={{ marginTop: multiline ? 12 : 0 }} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          keyboardType={keyboardType}
          multiline={multiline}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize={autoCapitalize}
          returnKeyType={onSubmitEditing ? 'done' : undefined}
          style={[styles.input, { color: colors.text, minHeight: multiline ? 96 : undefined, textAlignVertical: multiline ? 'top' : 'center' }]}
        />
        {unit && (
          <AppText variant="caption" tone="subtle">
            {unit}
          </AppText>
        )}
      </View>
      {(error || hint) && (
        <AppText variant="small" tone={error ? 'danger' : 'subtle'}>
          {error ?? hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', borderWidth: 1, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, fontSize: 15, paddingVertical: 12, outlineStyle: 'none' as never },
});
