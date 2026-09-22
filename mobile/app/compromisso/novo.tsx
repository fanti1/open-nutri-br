import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../src/data/DataProvider';
import { usePatient } from '../../src/data/hooks';
import { AppointmentForm } from '../../src/features/agenda/AppointmentForm';
import { parseDate } from '../../src/lib/format';
import { Screen } from '../../src/ui/Screen';
import { toast } from '../../src/ui/Toast';

function initialStart(date?: string): string {
  const start = date ? parseDate(date) : new Date();
  if (date) start.setHours(9, 0, 0, 0);
  else start.setHours(start.getHours() + 1, 0, 0, 0);
  return start.toISOString();
}

export default function NewAppointmentScreen() {
  const { date, patientId } = useLocalSearchParams<{ date?: string; patientId?: string }>();
  const router = useRouter();
  const { agenda } = useData();
  const { data: patient, loading } = usePatient(patientId);

  return (
    <Screen back title="Novo compromisso">
      {(!patientId || !loading) && (
        <AppointmentForm
          initial={{ starts_at: initialStart(date), patient_id: patient?.id ?? null, patient_name: patient?.name ?? null }}
          submitLabel="Agendar"
          onSubmit={async (input) => {
            await agenda.create(input);
            toast.success('Compromisso agendado');
            router.back();
          }}
        />
      )}
    </Screen>
  );
}
