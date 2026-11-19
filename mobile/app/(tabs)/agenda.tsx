import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { AppointmentRow } from '../../src/features/agenda/AppointmentRow';
import { addDays, formatWeekday, isSameDay, startOfDay, toDateOnly } from '../../src/lib/format';
import { AppText } from '../../src/ui/AppText';
import { Button } from '../../src/ui/Button';
import { Card } from '../../src/ui/Card';
import { Fab } from '../../src/ui/Fab';
import { MonthCalendar } from '../../src/ui/MonthCalendar';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';

export default function AgendaScreen() {
  const router = useRouter();
  const { appointments } = useData();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => startOfDay(new Date()));

  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const { data: monthAppointments = [] } = useLiveQuery(
    ['appointments', 'patients'],
    () => appointments.listBetween(monthStart.toISOString(), monthEnd.toISOString()),
    [month.getTime()],
  );
  const { data: dayAppointments = [] } = useLiveQuery(
    ['appointments', 'patients'],
    () => appointments.listBetween(selected.toISOString(), addDays(selected, 1).toISOString()),
    [selected.getTime()],
  );
  const { data: allUpcoming = [] } = useLiveQuery(['appointments', 'patients'], () => appointments.upcoming(new Date().toISOString(), 6));
  // O dia selecionado já aparece na seção acima; não repetir aqui.
  const upcoming = allUpcoming.filter((a) => !isSameDay(new Date(a.starts_at), selected)).slice(0, 5);

  const markedDays = new Set(monthAppointments.filter((a) => a.status !== 'cancelado').map((a) => toDateOnly(new Date(a.starts_at))));
  const newAppointment = () => router.push(`/compromisso/novo?date=${toDateOnly(selected)}`);

  return (
    <Screen
      title="Agenda"
      subtitle="Organize seus atendimentos e receba lembretes"
      hero={{ overlap: 44 }}
      floating={<Fab label="Agendar" icon="add" onPress={newAppointment} />}
    >
      <Card>
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={(day) => setSelected(startOfDay(day))}
          markedDays={markedDays}
        />
      </Card>

      <Section title={isSameDay(selected, new Date()) ? 'Hoje' : formatWeekday(selected)}>
        {dayAppointments.length ? (
          <View style={{ gap: 10 }}>
            {dayAppointments.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} onPress={() => router.push(`/compromisso/${appointment.id}`)} />
            ))}
          </View>
        ) : (
          <Card tone="alt" style={{ gap: 10, alignItems: 'flex-start' }}>
            <AppText tone="muted">Nada marcado para este dia.</AppText>
            <Button label="Agendar neste dia" icon="add" size="sm" variant="secondary" onPress={newAppointment} />
          </Card>
        )}
      </Section>

      {upcoming.length > 0 && (
        <Section title="Próximos">
          <View style={{ gap: 10 }}>
            {upcoming.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} showDay onPress={() => router.push(`/compromisso/${appointment.id}`)} />
            ))}
          </View>
        </Section>
      )}
    </Screen>
  );
}
