import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useAudience, useFavorites, useSettings } from '../../src/data/hooks';
import { backupOverdue } from '../../src/data/services/backupService';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { LIFE_STAGE_PLURAL } from '../../src/domain/calculators/support/lifeStage';
import { CATALOG, catalogEntry, MODULES, type CatalogEntry } from '../../src/domain/catalog';
import { AppointmentRow } from '../../src/features/agenda/AppointmentRow';
import { AreaGrid, AreaTile } from '../../src/features/calculators/AreaTile';
import { CalculatorGroup } from '../../src/features/calculators/CalculatorRow';
import { PatientRow } from '../../src/features/patients/PatientRow';
import { TaskRow } from '../../src/features/tasks/TaskRow';
import { addDays, formatTime, formatWeekday, startOfDay } from '../../src/lib/format';
import { useTheme } from '../../src/theme/ThemeProvider';
import { elevation } from '../../src/theme/tokens';
import { AppText } from '../../src/ui/AppText';
import { Avatar } from '../../src/ui/Avatar';
import { Callout } from '../../src/ui/Callout';
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
  const { colors, dark } = useTheme();
  const [audience] = useAudience();
  const { patients, appointments, tasks, taskActions, calculations } = useData();
  const { data: settings } = useSettings();
  const { data: favoriteSlugs = [] } = useFavorites();
  const openPatient = (id: string) => router.push(`/paciente/${id}`);

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
  const nextLabel = next ? `${formatTime(next.starts_at)} · ${next.patient_name ? `${next.title} com ${next.patient_name}` : next.title}` : null;
  // Só lembra do backup quando já existe algo a perder.
  const backupDue = !!dashboard?.recentPatients.length && backupOverdue(settings?.last_backup_at ?? null);

  return (
    <Screen
      title={`${greeting()}${firstName ? `, ${firstName}` : ''}!`}
      subtitle={formatWeekday(new Date())}
      hero={{ overlap: 64 }}
      right={
        <Pressable accessibilityRole="button" accessibilityLabel="Perfil profissional" onPress={() => router.push('/perfil')} hitSlop={8}>
          {/* Avatar sobre um disco branco: as iniciais coloridas não somem no verde do cabeçalho. */}
          <View style={{ padding: 3, borderRadius: 28, backgroundColor: colors.surface }}>
            <Avatar name={profileName || 'OpenNutri'} size={42} />
          </View>
        </Pressable>
      }
    >
      <Card
        onPress={() => router.push('/agenda')}
        accessibilityLabel={`Hoje: ${plural(scheduledToday.length, 'atendimento', 'atendimentos')} e ${plural(dashboard?.openTasks ?? 0, 'tarefa pendente', 'tarefas pendentes')}. ${nextLabel ? `Próximo: ${nextLabel}.` : 'Agenda livre.'} Abrir agenda.`}
        style={[{ gap: 14 }, elevation(2, dark)]}
      >
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TodayMetric value={scheduledToday.length} label={scheduledToday.length === 1 ? 'atendimento hoje' : 'atendimentos hoje'} color={colors.primary} background={colors.primarySoft} />
          <TodayMetric value={dashboard?.openTasks ?? 0} label={dashboard?.openTasks === 1 ? 'tarefa pendente' : 'tarefas pendentes'} color={colors.sun} background={colors.sunSoft} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: next ? colors.coralFill : colors.textSubtle }} />
          <AppText variant="bodyStrong" numberOfLines={1} style={{ flex: 1, fontSize: 14 }}>
            {nextLabel ?? 'Agenda livre: nenhum atendimento marcado'}
          </AppText>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </View>
      </Card>

      {backupDue && (
        <Callout tone="warning" icon="cloud-upload-outline" title={settings?.last_backup_at ? 'Faça um novo backup' : 'Faça seu primeiro backup'} onPress={() => router.push('/backup')}>
          Seus dados ficam só neste celular. Salve uma cópia no Google Drive.
        </Callout>
      )}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <QuickAction icon="person-add" label="Novo paciente" onPress={() => router.push('/paciente/novo')} />
        <QuickAction icon="calendar" label="Agendar" onPress={() => router.push('/compromisso/novo')} />
        <QuickAction icon="checkbox" label="Nova tarefa" onPress={() => router.push('/tarefa/novo')} />
      </View>

      <Section size="lg" title="Calcular por área" description={`Métodos validados para ${LIFE_STAGE_PLURAL[audience]}`} action="Todas" onAction={() => router.push('/calculadoras')}>
        <AreaGrid>
          {MODULES.map((module) => ({ module, count: CATALOG.filter((entry) => entry.module === module.key && entry.life_stages.includes(audience)).length }))
            .filter(({ count }) => count > 0)
            .map(({ module, count }) => (
              <AreaTile key={module.key} module={module} count={count} onPress={() => router.push(`/calculadoras?area=${module.key}`)} />
            ))}
        </AreaGrid>
      </Section>

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
              <PatientRow key={patient.id} patient={patient} onPress={openPatient} divider={index > 0} />
            ))}
          </Card>
        </Section>
      )}
    </Screen>
  );
}

/** Número do dia num bloco de cor suave (atendimentos, tarefas). */
function TodayMetric({ value, label, color, background }: { value: number; label: string; color: string; background: string }) {
  const { radius } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: background, borderRadius: radius.md, padding: 14 }}>
      <AppText variant="display" color={color} style={{ fontSize: 32, lineHeight: 36 }}>
        {value}
      </AppText>
      <AppText variant="caption" color={color} style={{ fontWeight: '800' }}>
        {label}
      </AppText>
    </View>
  );
}

/** Atalho em bloco: ícone sobre o rótulo, lado a lado — o rótulo inteiro sempre cabe. */
function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Card onPress={onPress} accessibilityLabel={label} style={{ flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 4 }}>
      <IconTile name={icon} size={42} />
      <AppText variant="small" align="center" numberOfLines={2} style={{ fontWeight: '800', fontSize: 13 }}>
        {label}
      </AppText>
    </Card>
  );
}
