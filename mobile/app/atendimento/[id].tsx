import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { usePatient } from '../../src/data/hooks';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { ConsultationForm } from '../../src/features/consultations/ConsultationForm';
import { Button } from '../../src/ui/Button';
import { confirm } from '../../src/ui/dialogs';
import { Screen } from '../../src/ui/Screen';
import { toast } from '../../src/ui/Toast';

export default function ConsultationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { consultations } = useData();
  const { data: consultation } = useLiveQuery(['consultations'], () => consultations.get(id), [id]);
  const { data: patient } = usePatient(consultation?.patient_id);

  if (!consultation) return <Screen back title="Atendimento" />;

  const remove = async () => {
    if (!(await confirm('Excluir atendimento', 'O registro e as medidas deste atendimento serão apagados.', 'Excluir', true))) return;
    await consultations.remove(consultation.id);
    toast.success('Atendimento excluído');
    router.back();
  };

  return (
    <Screen back title="Atendimento" subtitle={patient?.name}>
      <Button
        label="Calcular com estas medidas"
        icon="calculator"
        variant="secondary"
        onPress={() => router.push(`/paciente/calcular/${consultation.patient_id}?consultationId=${consultation.id}`)}
      />
      <ConsultationForm
        key={consultation.updated_at}
        patientId={consultation.patient_id}
        initial={consultation}
        onSubmit={async (input) => {
          await consultations.update(consultation.id, input);
          toast.success('Atendimento atualizado');
        }}
      />
      <View style={{ marginTop: 8 }}>
        <Button label="Excluir atendimento" icon="trash-outline" variant="danger" onPress={remove} fullWidth />
      </View>
    </Screen>
  );
}
