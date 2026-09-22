import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import type { AppointmentStatus } from '../../src/data/models';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { AppointmentForm } from '../../src/features/agenda/AppointmentForm';
import { STATUS_LABELS, useStatusColor } from '../../src/features/agenda/AppointmentRow';
import { formatDateTime } from '../../src/lib/format';
import { AppText } from '../../src/ui/AppText';
import { Badge } from '../../src/ui/Badge';
import { Button } from '../../src/ui/Button';
import { Card } from '../../src/ui/Card';
import { confirm } from '../../src/ui/dialogs';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';
import { toast } from '../../src/ui/Toast';

export default function AppointmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { appointments, agenda } = useData();
  const { data: appointment } = useLiveQuery(['appointments', 'patients'], () => appointments.get(id), [id]);
  const statusColor = useStatusColor(appointment?.status ?? 'agendado');

  if (!appointment) return <Screen back title="Compromisso" />;

  const setStatus = async (status: AppointmentStatus) => {
    await agenda.setStatus(appointment.id, status);
    toast.success(`Marcado como ${STATUS_LABELS[status].toLowerCase()}`);
  };

  const remove = async () => {
    if (!(await confirm('Excluir compromisso', 'O compromisso e o lembrete serão removidos.', 'Excluir', true))) return;
    await agenda.remove(appointment.id);
    toast.success('Compromisso excluído');
    router.back();
  };

  return (
    <Screen back title={appointment.title} subtitle={formatDateTime(appointment.starts_at)}>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="caption" tone="muted">
            Situação
          </AppText>
          <Badge label={STATUS_LABELS[appointment.status]} color={statusColor} />
        </View>
        {appointment.status === 'agendado' ? (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button label="Realizado" icon="checkmark-circle-outline" size="sm" onPress={() => setStatus('realizado')} />
            <Button label="Faltou" size="sm" variant="secondary" onPress={() => setStatus('faltou')} />
            <Button label="Cancelar" size="sm" variant="ghost" onPress={() => setStatus('cancelado')} />
          </View>
        ) : (
          <Button label="Voltar para agendado" size="sm" variant="secondary" onPress={() => setStatus('agendado')} />
        )}
        {appointment.patient_id && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Abrir ficha" size="sm" variant="ghost" icon="person-outline" onPress={() => router.push(`/paciente/${appointment.patient_id}`)} style={{ flex: 1 }} />
            <Button
              label="Registrar atendimento"
              size="sm"
              variant="ghost"
              icon="document-text-outline"
              onPress={() => router.push(`/atendimento/novo?patientId=${appointment.patient_id}`)}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </Card>

      <Section title="Editar">
        <AppointmentForm
          key={appointment.updated_at}
          initial={appointment}
          submitLabel="Salvar alterações"
          onSubmit={async (input) => {
            await agenda.update(appointment.id, input);
            toast.success('Compromisso atualizado');
          }}
        />
      </Section>

      <Button label="Excluir compromisso" icon="trash-outline" variant="danger" onPress={remove} fullWidth />
    </Screen>
  );
}
