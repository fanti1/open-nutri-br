import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../src/data/DataProvider';
import { usePatient } from '../../src/data/hooks';
import { ConsultationForm } from '../../src/features/consultations/ConsultationForm';
import { Screen } from '../../src/ui/Screen';
import { toast } from '../../src/ui/Toast';

export default function NewConsultationScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const { consultations } = useData();
  const { data: patient } = usePatient(patientId);

  return (
    <Screen back title="Novo atendimento" subtitle={patient?.name}>
      <ConsultationForm
        patientId={patientId}
        onSubmit={async (input) => {
          const id = await consultations.create(input);
          toast.success('Atendimento registrado');
          router.replace(`/atendimento/${id}`);
        }}
      />
    </Screen>
  );
}
