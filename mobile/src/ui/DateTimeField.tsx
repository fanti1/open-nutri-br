import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatDate, formatTime, startOfDay } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { Button } from './Button';
import { ChipGroup } from './Chips';
import { MonthCalendar } from './MonthCalendar';
import { Sheet } from './Sheet';
import { TextField } from './TextField';

interface DateTimeFieldProps {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  mode?: 'date' | 'datetime';
  clearable?: boolean;
  placeholder?: string;
}

const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

/**
 * Campo de data (e hora) com calendário próprio — funciona igual no celular e
 * no navegador, sem depender do seletor nativo de cada plataforma.
 */
export function DateTimeField({ label, value, onChange, mode = 'date', clearable, placeholder = 'Selecionar' }: DateTimeFieldProps) {
  const { colors, radius, layout } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());
  const [month, setMonth] = useState<Date>(value ?? new Date());

  const [typed, setTyped] = useState('');

  const openSheet = () => {
    const base = value ?? defaultDraft(mode);
    setDraft(base);
    setMonth(base);
    setTyped('');
    setOpen(true);
  };

  const setDay = (day: Date) => {
    const next = new Date(day);
    next.setHours(draft.getHours(), draft.getMinutes(), 0, 0);
    setDraft(next);
  };

  const setTime = (hours: string | null, minutes: string | null) => {
    const next = new Date(draft);
    if (hours !== null) next.setHours(Number(hours));
    if (minutes !== null) next.setMinutes(Number(minutes));
    setDraft(next);
  };

  const display = value ? (mode === 'datetime' ? `${formatDate(value.toISOString())} às ${formatTime(value.toISOString())}` : formatDate(value.toISOString())) : placeholder;

  return (
    <View style={{ gap: 6 }}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      {/* Mesmo visual dos campos de texto: preenchido, sem borda. */}
      {/* O leitor de tela anuncia o campo e o valor ("Data de nascimento, 14/05/1990"), não só "Selecionar". */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label.replace(/ \*$/, '')}, ${value ? display : 'não preenchido'}`}
        accessibilityHint="Abre o calendário"
        onPress={openSheet}
        style={({ pressed }) => [styles.box, { borderColor: 'transparent', backgroundColor: pressed ? colors.surfacePressed : colors.surfaceAlt, borderRadius: radius.md, minHeight: layout.controlHeight }]}
      >
        <Ionicons name={mode === 'datetime' ? 'time-outline' : 'calendar-outline'} size={18} color={colors.textSubtle} />
        <AppText variant="body" tone={value ? 'default' : 'subtle'} style={{ flex: 1 }}>
          {display}
        </AppText>
        {clearable && value && (
          <Pressable accessibilityRole="button" accessibilityLabel={label ? `Limpar ${label}` : 'Limpar'} onPress={() => onChange(null)} hitSlop={13}>
            <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
          </Pressable>
        )}
      </Pressable>

      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View style={{ gap: 16 }}>
          <TextField
            label="Digitar a data"
            placeholder="dd/mm/aaaa"
            keyboardType="number-pad"
            value={typed}
            onChangeText={(text) => {
              const masked = maskDate(text);
              setTyped(masked);
              const parsed = parseTypedDate(masked);
              if (parsed) {
                setDay(parsed);
                setMonth(parsed);
              }
            }}
            error={typed.length === 10 && !parseTypedDate(typed) ? 'Data inválida.' : null}
          />
          <MonthCalendar month={month} onMonthChange={setMonth} selected={draft} onSelect={setDay} />

          {mode === 'datetime' && (
            <View style={{ gap: 10 }}>
              <AppText variant="caption" tone="muted">
                Hora
              </AppText>
              <ChipGroup
                scroll
                options={HOURS.map((h) => ({ value: h, label: `${h}h` }))}
                value={String(draft.getHours()).padStart(2, '0')}
                onChange={(h) => setTime(h, null)}
              />
              <ChipGroup
                options={MINUTES.map((m) => ({ value: m, label: `:${m}` }))}
                value={String(draft.getMinutes()).padStart(2, '0')}
                onChange={(m) => setTime(null, m)}
              />
            </View>
          )}

          <Button
            label="Confirmar"
            fullWidth
            onPress={() => {
              onChange(mode === 'date' ? startOfDay(draft) : draft);
              setOpen(false);
            }}
          />
        </View>
      </Sheet>
    </View>
  );
}

function defaultDraft(mode: 'date' | 'datetime'): Date {
  const now = new Date();
  if (mode === 'date') return now;
  const next = new Date(now);
  next.setHours(now.getHours() + 1, 0, 0, 0);
  return next;
}

/** Insere as barras enquanto a pessoa digita: "25031990" → "25/03/1990". */
export function maskDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

/** "dd/mm/aaaa" → Date (fuso local), ou null se incompleta/inexistente (ex.: 31/02). */
export function parseTypedDate(text: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, dd, mm, yyyy] = match.map(Number);
  const date = new Date(yyyy, mm - 1, dd, 12);
  const valid = date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd && yyyy >= 1900;
  return valid ? date : null;
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, paddingHorizontal: 14, paddingVertical: 12 },
});
