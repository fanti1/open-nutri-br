import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useData } from '../../../data/DataProvider';
import type { Patient } from '../../../data/models';
import { useLiveQuery } from '../../../data/useLiveQuery';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { Section } from '../../../ui/Section';
import { AppointmentRow } from '../../agenda/AppointmentRow';
import { TaskRow } from '../../tasks/TaskRow';

/** Compromissos e tarefas ligados a este paciente. */
export function AgendaSection({ patient }: { patient: Patient }) {
  const router = useRouter();
  const { appointments, tasks, taskActions } = useData();
  const { data: patientAppointments = [] } = useLiveQuery(['appointments'], () => appointments.listByPatient(patient.id), [patient.id]);
  const { data: patientTasks = [] } = useLiveQuery(['tasks'], () => tasks.listByPatient(patient.id), [patient.id]);

  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button label="Agendar" icon="calendar" variant="secondary" onPress={() => router.push(`/compromisso/novo?patientId=${patient.id}`)} style={{ flex: 1 }} />
        <Button label="Nova tarefa" icon="checkbox" variant="secondary" onPress={() => router.push(`/tarefa/novo?patientId=${patient.id}`)} style={{ flex: 1 }} />
      </View>

      <Section title="Compromissos">
        {patientAppointments.length ? (
          <View style={{ gap: 10 }}>
            {patientAppointments.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} showDay onPress={() => router.push(`/compromisso/${appointment.id}`)} />
            ))}
          </View>
        ) : (
          <AppText tone="muted">Nenhum compromisso com este paciente.</AppText>
        )}
      </Section>

      <Section title="Tarefas">
        {patientTasks.length ? (
          <Card padded={false} style={{ paddingHorizontal: 16 }}>
            {patientTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => taskActions.setDone(task.id, task.done === 0)} onPress={() => router.push(`/tarefa/${task.id}`)} />
            ))}
          </Card>
        ) : (
          <AppText tone="muted">Nenhuma tarefa relacionada.</AppText>
        )}
      </Section>
    </View>
  );
}
