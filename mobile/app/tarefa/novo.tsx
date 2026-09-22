import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../src/data/DataProvider';
import { usePatient } from '../../src/data/hooks';
import { TaskForm } from '../../src/features/tasks/TaskForm';
import { Screen } from '../../src/ui/Screen';
import { toast } from '../../src/ui/Toast';

export default function NewTaskScreen() {
  const { patientId } = useLocalSearchParams<{ patientId?: string }>();
  const router = useRouter();
  const { taskActions } = useData();
  const { data: patient, loading } = usePatient(patientId);

  return (
    <Screen back title="Nova tarefa">
      {(!patientId || !loading) && (
        <TaskForm
          initial={{ patient_id: patient?.id ?? null, patient_name: patient?.name ?? null }}
          submitLabel="Adicionar tarefa"
          onSubmit={async (input) => {
            await taskActions.create(input);
            toast.success('Tarefa adicionada');
            router.back();
          }}
        />
      )}
    </Screen>
  );
}
