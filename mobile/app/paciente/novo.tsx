import { useRouter } from 'expo-router';
import { useData } from '../../src/data/DataProvider';
import { PatientForm } from '../../src/features/patients/PatientForm';
import { Screen } from '../../src/ui/Screen';
import { toast } from '../../src/ui/Toast';

export default function NewPatientScreen() {
  const router = useRouter();
  const { patients } = useData();

  return (
    <Screen back title="Novo paciente" subtitle="Crie a ficha para registrar atendimentos e cálculos">
      <PatientForm
        submitLabel="Criar ficha"
        onSubmit={async (input) => {
          const id = await patients.create(input);
          toast.success('Ficha criada');
          router.replace(`/paciente/${id}`);
        }}
      />
    </Screen>
  );
}
