import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'] as const;

/** Bolinhas do PIN + teclado numérico grande (fácil de acertar com o polegar). */
export function PinPad({
  value,
  length,
  onChange,
  onBiometrics,
  error,
}: {
  value: string;
  /** Quantas bolinhas mostrar (tamanho do PIN, ou 6 ao criar). */
  length: number;
  onChange: (value: string) => void;
  onBiometrics?: () => void;
  error?: boolean;
}) {
  const { colors } = useTheme();
  // Valor mais recente, atualizado na hora do toque: toques rápidos (antes de a
  // tela redesenhar) não podem partir do valor antigo e engolir dígitos.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const press = (key: (typeof KEYS)[number]) => {
    if (key === 'bio') return onBiometrics?.();
    const current = latest.current;
    const next = key === 'del' ? current.slice(0, -1) : current.length < 6 ? current + key : current;
    if (next === current) return;
    latest.current = next;
    onChange(next);
  };

  return (
    <View style={{ alignItems: 'center', gap: 28 }}>
      <View style={{ flexDirection: 'row', gap: 14 }} accessibilityLabel={`${value.length} de ${length} dígitos`}>
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: error ? colors.danger : colors.primary,
              backgroundColor: i < value.length ? (error ? colors.danger : colors.primary) : 'transparent',
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 264, gap: 12, justifyContent: 'center' }}>
        {KEYS.map((key) => {
          if (key === 'bio' && !onBiometrics) return <View key={key} style={{ width: 80, height: 64 }} />;
          const label = key === 'del' ? 'Apagar' : key === 'bio' ? 'Usar digital' : key;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={label}
              testID={`pin-${key}`}
              onPress={() => press(key)}
              style={({ pressed }) => ({
                width: 80,
                height: 64,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: key === 'del' || key === 'bio' ? 'transparent' : pressed ? colors.primarySoft : colors.surfaceAlt,
              })}
            >
              {key === 'del' ? (
                <Ionicons name="backspace-outline" size={26} color={colors.text} />
              ) : key === 'bio' ? (
                <Ionicons name="finger-print" size={30} color={colors.primary} />
              ) : (
                <AppText variant="title">{key}</AppText>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
