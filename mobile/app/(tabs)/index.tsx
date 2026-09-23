import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useFavorites, useSettings } from '../../src/data/hooks';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { catalogEntry, type CatalogEntry } from '../../src/domain/catalog';
import { AppointmentRow } from '../../src/features/agenda/AppointmentRow';
import { CalculatorGroup } from '../../src/features/calculators/CalculatorRow';
import { TaskRow } from '../../src/features/tasks/TaskRow';
import { addDays, formatAge, formatTime, formatWeekday, startOfDay } from '../../src/lib/format';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Avatar } from '../../src/ui/Avatar';
import { Card } from '../../src/ui/Card';
import { IconTile, type IconName } from '../../src/ui/IconTile';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';

const DEFAULT_CALCULATORS = ['imc', 'mifflin-st-jeor', 'nrs-2002', 'oms-imc-idade-5-19'];

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { patients, appointments, tasks, taskActions, calculations } = useData();
  const { data: settings } = useSettings();
  const { data: favoriteSlugs = [] } = useFavorites();

  const today = startOfDay(new Date());
  const { data: dashboard } = useLiveQuery(['patients', 'appointments', 'tasks', 'calculations'], async () => {
    const [todayAppointments, upcoming, openTasks, pendingTasks, recentPatients, mostUsed] = await Promise.all([
      appointments.listBetween(today.toISOString(), addDays(today, 1).toISOString()),
      appointments.upcoming(new Date().toISOString(), 3),
      tasks.countOpen(),
      tasks.list('pendentes'),
      patients.recent(3),
      calculations.mostUsedSlugs(5),
    ]);
    return { todayAppointments, upcoming, openTasks, pendingTasks: pendingTasks.slice(0, 3), recentPatients, mostUsed };
  });

  const quickEntries = [...new Set([...favoriteSlugs, ...(dashboard?.mostUsed ?? []), ...DEFAULT_CALCULATORS])]
    .slice(0, 4)
    .map(catalogEntry)
    .filter((entry): entry is CatalogEntry => !!entry);

  const profileName = settings?.profile.name ?? '';
  const firstName = profileName.split(' ')[0];
  const scheduledToday = dashboard?.todayAppointments.filter((a) => a.status === 'agendado') ?? [];
  const next = dashboard?.upcoming[0];

  return (
    <Screen
      title={`${greeting()}${firstName ? `, ${firstName}` : ''}!`}
      subtitle={formatWeekday(new Date())}
      right={
        <Pressable accessibilityLabel="Perfil profissional" onPress={() => router.push('/perfil')} hitSlop={8}>
          <Avatar name={profileName || 'OpenNutri'} size={40} />
        </Pressable>
      }
    >
      <Card tone="primary" onPress={() => router.push('/agenda')} style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="overline" tone="onPrimary" style={{ opacity: 0.85 }}>
            Hoje
          </AppText>
          <Ionicons name="chevron-forward" size={18} color={colors.onPrimary} />
        </View>
        <View style={{ flexDirection: 'row', gap: 24 }}>
          <TodayMetric value={scheduledToday.length} label={scheduledToday.length === 1 ? 'atendimento' : 'atendimentos'} />
          <TodayMetric value={dashboard?.openTasks ?? 0} label={dashboard?.openTasks === 1 ? 'tarefa pendente' : 'tarefas pendentes'} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: `${colors.onPrimary}33` }}>
          <Ionicons name="time-outline" size={16} color={colors.onPrimary} />
          <AppText variant="caption" tone="onPrimary" numberOfLines={1} style={{ flex: 1 }}>
            {next ? `Próximo: ${formatTime(next.starts_at)} — ${next.patient_name ?? next.title}` : 'Agenda livre — nenhum atendimento marcado'}
          </AppText>
        </View>
      </Card>

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <QuickAction icon="person-add-outline" label="Novo paciente" onPress={() => router.push('/paciente/novo')} />
          <QuickAction icon="calendar-outline" label="Agendar" onPress={() => router.push('/compromisso/novo')} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <QuickAction icon="checkbox-outline" label="Nova tarefa" onPress={() => router.push('/tarefa/novo')} />
          <QuickAction icon="calculator-outline" label="Calculadoras" onPress={() => router.push('/calculadoras')} />
        </View>
      </View>

      {!!dashboard?.upcoming.length && (
        <Section size="lg" title="Próximos atendimentos" action="Agenda" onAction={() => router.push('/agenda')}>
          <View style={{ gap: 10 }}>
            {dashboard.upcoming.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} showDay onPress={() => router.push(`/compromisso/${appointment.id}`)} />
            ))}
          </View>
        </Section>
      )}

      {!!dashboard?.pendingTasks.length && (
        <Section size="lg" title="Tarefas pendentes" action={`Ver ${plural(dashboard.openTasks, 'tarefa', 'tarefas')}`} onAction={() => router.push('/tarefas')}>
          <Card padded={false} style={{ paddingHorizontal: 16 }}>
            {dashboard.pendingTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => taskActions.setDone(task.id, true)} onPress={() => router.push(`/tarefa/${task.id}`)} />
            ))}
          </Card>
        </Section>
      )}

      <Section
        size="lg"
        title={favoriteSlugs.length ? 'Suas calculadoras' : 'Calculadoras mais usadas'}
        description={favoriteSlugs.length ? undefined : 'Toque na estrela de uma calculadora para fixá-la aqui.'}
        action="Todas"
        onAction={() => router.push('/calculadoras')}
      >
        <CalculatorGroup entries={quickEntries} onOpen={(entry) => router.push(`/calculadora/${entry.slug}`)} showModule />
      </Section>

      {!!dashboard?.recentPatients.length && (
        <Section size="lg" title="Pacientes recentes" action="Todos" onAction={() => router.push('/pacientes')}>
          <Card padded={false} style={{ overflow: 'hidden' }}>
            {dashboard.recentPatients.map((patient, index) => (
              <Pressable
                key={patient.id}
                accessibilityRole="button"
                onPress={() => router.push(`/paciente/${patient.id}`)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderTopWidth: index ? 1 : 0,
                  borderTopColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Avatar name={patient.name} size={36} />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyStrong">{patient.name}</AppText>
                  <AppText variant="caption" tone="muted">
                    {formatAge(patient.birth_date)}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
              </Pressable>
            ))}
          </Card>
        </Section>
      )}
    </Screen>
  );
}

function TodayMetric({ value, label }: { value: number; label: string }) {
  return (
    <View>
      <AppText variant="display" tone="onPrimary">
        {value}
      </AppText>
      <AppText variant="caption" tone="onPrimary" style={{ opacity: 0.9 }}>
        {label}
      </AppText>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 12 }}>
      <IconTile name={icon} size={36} />
      <AppText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
        {label}
      </AppText>
    </Card>
  );
}
