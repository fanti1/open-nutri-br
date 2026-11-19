import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fontFamilies } from '../theme/tokens';
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
  /** Esconde o que é digitado (senhas, PIN). */
  secureTextEntry?: boolean;
  maxLength?: number;
  onBlur?: () => void;
  /** Seleciona o valor ao tocar: digitar substitui um valor sugerido (ex.: 100 g) em vez de somar dígitos. */
  selectTextOnFocus?: boolean;
  /** Mostra um "x" para apagar o texto (campos de busca). */
  clearable?: boolean;
  /** Fundo de superfície em vez do preenchimento suave (ex.: busca sobre um cabeçalho colorido). */
  raised?: boolean;
}

export function TextField({
  label, value, onChangeText, placeholder, unit, hint, error, keyboardType, multiline, icon, autoFocus, onSubmitEditing, autoCapitalize, secureTextEntry, maxLength, onBlur, selectTextOnFocus, clearable, raised,
}: TextFieldProps) {
  const { colors, radius, layout } = useTheme();
  const [focused, setFocused] = useState(false);

  // No Android a região viva do texto de erro anuncia; o VoiceOver (iOS) ignora regiões vivas.
  useEffect(() => {
    if (error && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(label ? `${label}: ${error}` : error);
  }, [error, label]);

  // Campo preenchido: fundo suave sem borda; a borda só aparece no foco (marca) ou no erro.
  const borderColor = error ? colors.danger : focused ? colors.borderStrong : 'transparent';
  const message = error ?? hint;

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <AppText variant="label" tone={error ? 'danger' : 'muted'}>
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.box,
          {
            borderColor,
            backgroundColor: focused || raised ? colors.surface : colors.surfaceAlt,
            borderRadius: radius.md,
            minHeight: layout.controlHeight,
            alignItems: multiline ? 'flex-start' : 'center',
            // Borda de largura fixa (transparente em repouso): o foco não desloca o layout.
            borderWidth: 2,
            paddingHorizontal: 12,
          },
        ]}
      >
        {icon && <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textSubtle} style={{ marginTop: multiline ? 14 : 0 }} />}
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
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          selectTextOnFocus={selectTextOnFocus}
          accessibilityLabel={label ?? placeholder}
          accessibilityHint={message ?? undefined}
          aria-invalid={!!error}
          returnKeyType={onSubmitEditing ? 'done' : undefined}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          maxFontSizeMultiplier={1.6}
          style={[styles.input, { color: colors.text, minHeight: multiline ? 96 : undefined, textAlignVertical: multiline ? 'top' : 'center' }]}
        />
        {unit && (
          <AppText variant="label" tone="subtle">
            {unit}
          </AppText>
        )}
        {clearable && value.length > 0 && (
          <Pressable accessibilityRole="button" accessibilityLabel="Limpar" onPress={() => onChangeText('')} hitSlop={12}>
            <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
          </Pressable>
        )}
        {error && !clearable && <Ionicons name="alert-circle" size={18} color={colors.danger} />}
      </View>
      {message && (
        <AppText variant="small" tone={error ? 'danger' : 'subtle'} accessibilityLiveRegion={error ? 'polite' : 'none'}>
          {message}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, fontSize: 16, fontFamily: fontFamilies[600], paddingVertical: 12, outlineStyle: 'none' as never },
});
