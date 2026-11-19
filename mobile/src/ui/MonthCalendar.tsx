import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatMonth, isSameDay, toDateOnly } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const DAY_LABEL = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' });

interface MonthCalendarProps {
  month: Date;
  selected: Date | null;
  onSelect: (date: Date) => void;
  onMonthChange: (month: Date) => void;
  /** Dias ("AAAA-MM-DD") com algo marcado — ganham um ponto. */
  markedDays?: Set<string>;
}

function monthGrid(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function MonthCalendar({ month, selected, onSelect, onMonthChange, markedDays }: MonthCalendarProps) {
  const { colors } = useTheme();
  const today = new Date();

  const shift = (delta: number) => onMonthChange(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={() => shift(-1)} hitSlop={10} style={styles.nav}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <AppText variant="heading">{formatMonth(month)}</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={() => shift(1)} hitSlop={10} style={styles.nav}>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.row}>
        {WEEKDAYS.map((day, index) => (
          <View key={index} style={styles.cell}>
            <AppText variant="small" tone="subtle">
              {day}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {monthGrid(month).map((date, index) => {
          if (!date) return <View key={index} style={styles.cell} />;

          const isSelected = selected ? isSameDay(date, selected) : false;
          const isToday = isSameDay(date, today);
          const marked = markedDays?.has(toDateOnly(date));

          return (
            <Pressable
              key={index}
              style={styles.cell}
              onPress={() => onSelect(date)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              // "12 de novembro, quinta-feira, hoje, com compromissos" — e não "2026-11-12".
              accessibilityLabel={[DAY_LABEL.format(date), isToday && 'hoje', marked && 'com compromissos'].filter(Boolean).join(', ')}
            >
              <View
                style={[
                  styles.day,
                  isSelected && { backgroundColor: colors.primary },
                  !isSelected && isToday && { borderWidth: 1.5, borderColor: colors.primary },
                ]}
              >
                <AppText variant="bodyStrong" color={isSelected ? colors.onPrimary : isToday ? colors.primary : colors.text}>
                  {date.getDate()}
                </AppText>
              </View>
              <View style={[styles.dot, { backgroundColor: marked ? (isSelected ? colors.primary : colors.accent) : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { padding: 6 },
  row: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
});
