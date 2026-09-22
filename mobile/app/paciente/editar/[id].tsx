import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../../src/data/DataProvider';
import { usePatient } from '../../../src/data/hooks';
import { PatientForm } from '../../../src/features/patients/PatientForm';
import { Screen } from '../../../src/ui/Screen';
import { toast } from '../../../src/ui/Toast';

export default function EditPatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { patients } = useData();
  const { data: patient } = usePatient(id);

  return (
    <Screen back title="Editar ficha" subtitle={patient?.name}>
      {patient && (
        <PatientForm
          initial={patient}
          submitLabel="Salvar alterações"
          onSubmit={async (input) => {
            await patients.update(id, input);
            toast.success('Ficha atualizada');
            router.back();
          }}
        />
      )}
    </Screen>
  );
}
