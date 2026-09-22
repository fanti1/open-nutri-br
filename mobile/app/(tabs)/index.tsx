import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useFavorites, useSettings } from '../../src/data/hooks';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { catalogEntry, CATALOG } from '../../src/domain/catalog';
import { AppointmentRow } from '../../src/features/agenda/AppointmentRow';
import { CalculatorTile } from '../../src/features/calculators/CalculatorRow';
import { TaskRow } from '../../src/features/tasks/TaskRow';
import { addDays, formatAge, formatWeekday, startOfDay } from '../../src/lib/format';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Avatar } from '../../src/ui/Avatar';
import { Card } from '../../src/ui/Card';
import { IconTile, type IconName } from '../../src/ui/IconTile';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { patients, appointments, tasks, taskActions, calculations } = useData();
  const { data: settings } = useSettings();
  const { data: favoriteSlugs = [] } = useFavorites();

  const today = startOfDay(new Date());
  const { data: dashboard } = useLiveQuery(['patients', 'appointments', 'tasks', 'calculations'], async () => {
    const [patientCount, todayAppointments, upcoming, openTasks, pendingTasks, recentPatients, mostUsed] = await Promise.all([
      patients.count(),
      appointments.listBetween(today.toISOString(), addDays(today, 1).toISOString()),
      appointments.upcoming(new Date().toISOString(), 3),
      tasks.countOpen(),
      tasks.list('pendentes'),
      patients.recent(4),
      calculations.mostUsedSlugs(6),
    ]);
    return { patientCount, todayAppointments, upcoming, openTasks, pendingTasks: pendingTasks.slice(0, 4), recentPatients, mostUsed };
  });

  const quickSlugs = [...new Set([...favoriteSlugs, ...(dashboard?.mostUsed ?? []), 'imc', 'mifflin-st-jeor', 'nrs-2002', 'oms-imc-idade-5-19'])].slice(0, 8);
  const quickEntries = quickSlugs.map(catalogEntry).filter((e) => e !== undefined);
  const firstName = settings?.profile.name.split(' ')[0];

  return (
    <Screen title={`${greeting()}${firstName ? `, ${firstName}` : ''}!`} subtitle={formatWeekday(new Date())}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Stat icon="people" label="Pacientes" value={dashboard?.patientCount ?? 0} color={colors.primary} onPress={() => router.push('/pacientes')} />
        <Stat icon="calendar" label="Hoje" value={dashboard?.todayAppointments.filter((a) => a.status === 'agendado').length ?? 0} color={colors.info} onPress={() => router.push('/agenda')} />
        <Stat icon="checkbox" label="Tarefas" value={dashboard?.openTasks ?? 0} color={colors.accent} onPress={() => router.push('/tarefas')} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <QuickAction icon="person-add-outline" label="Paciente" onPress={() => router.push('/paciente/novo')} />
        <QuickAction icon="calendar-outline" label="Agendar" onPress={() => router.push('/compromisso/novo')} />
        <QuickAction icon="checkmark-done-outline" label="Tarefa" onPress={() => router.push('/tarefa/novo')} />
        <QuickAction icon="calculator-outline" label="Calcular" onPress={() => router.push('/calculadoras')} />
      </View>

      <Section title="Próximos atendimentos" action="Ver agenda" onAction={() => router.push('/agenda')}>
        {dashboard?.upcoming.length ? (
          <View style={{ gap: 10 }}>
            {dashboard.upcoming.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} showDay onPress={() => router.push(`/compromisso/${appointment.id}`)} />
            ))}
          </View>
        ) : (
          <Card tone="alt">
            <AppText tone="muted">Nenhum atendimento agendado. Toque em “Agendar” para marcar o próximo.</AppText>
          </Card>
        )}
      </Section>

      <Section title="Tarefas" action="Ver todas" onAction={() => router.push('/tarefas')}>
        <Card padded={false} style={{ paddingHorizontal: 16 }}>
          {dashboard?.pendingTasks.length ? (
            dashboard.pendingTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => taskActions.setDone(task.id, true)} onPress={() => router.push(`/tarefa/${task.id}`)} />
            ))
          ) : (
            <AppText tone="muted" style={{ paddingVertical: 16 }}>
              Tudo em dia! Nenhuma tarefa pendente.
            </AppText>
          )}
        </Card>
      </Section>

      <Section title="Acesso rápido" action="Todas" onAction={() => router.push('/calculadoras')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }}>
          {quickEntries.map((entry) => (
            <CalculatorTile key={entry.slug} entry={entry} onPress={() => router.push(`/calculadora/${entry.slug}`)} />
          ))}
        </ScrollView>
        <AppText variant="small" tone="subtle">
          {CATALOG.length} calculadoras disponíveis · favorite com a estrela para fixar aqui.
        </AppText>
      </Section>

      {!!dashboard?.recentPatients.length && (
        <Section title="Pacientes recentes" action="Ver todos" onAction={() => router.push('/pacientes')}>
          <Card padded={false} style={{ paddingHorizontal: 16 }}>
            {dashboard.recentPatients.map((patient, index) => (
              <Pressable
                key={patient.id}
                onPress={() => router.push(`/paciente/${patient.id}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}
              >
                <Avatar name={patient.name} size={38} />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyStrong">{patient.name}</AppText>
                  <AppText variant="caption" tone="muted">
                    {formatAge(patient.birth_date)}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </Card>
        </Section>
      )}
    </Screen>
  );
}

function Stat({ icon, label, value, color, onPress }: { icon: IconName; label: string; value: number; color: string; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={{ flex: 1, gap: 8 }}>
      <IconTile name={icon} color={color} size={34} />
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
    </Card>
  );
}

function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 6, opacity: pressed ? 0.7 : 1 })}>
      <IconTile name={icon} size={52} />
      <AppText variant="small" tone="muted">
        {label}
      </AppText>
    </Pressable>
  );
}
