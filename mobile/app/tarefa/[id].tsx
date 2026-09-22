import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { usePatient } from '../../src/data/hooks';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { TaskForm } from '../../src/features/tasks/TaskForm';
import { Button } from '../../src/ui/Button';
import { confirm } from '../../src/ui/dialogs';
import { Screen } from '../../src/ui/Screen';
import { toast } from '../../src/ui/Toast';

export default function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, taskActions } = useData();
  const { data: task } = useLiveQuery(['tasks'], () => tasks.get(id), [id]);
  const { data: patient, loading } = usePatient(task?.patient_id ?? undefined);

  if (!task || (task.patient_id && loading)) return <Screen back title="Tarefa" />;

  const done = task.done === 1;

  const remove = async () => {
    if (!(await confirm('Excluir tarefa', `Remover “${task.title}”?`, 'Excluir', true))) return;
    await taskActions.remove(task.id);
    toast.success('Tarefa excluída');
    router.back();
  };

  return (
    <Screen back title="Tarefa">
      <Button
        label={done ? 'Reabrir tarefa' : 'Marcar como concluída'}
        icon={done ? 'refresh' : 'checkmark-circle'}
        variant={done ? 'secondary' : 'primary'}
        onPress={async () => {
          await taskActions.setDone(task.id, !done);
          toast.success(done ? 'Tarefa reaberta' : 'Tarefa concluída');
          if (!done) router.back();
        }}
      />
      <TaskForm
        key={task.updated_at}
        initial={{ ...task, patient_name: patient?.name ?? null }}
        submitLabel="Salvar alterações"
        onSubmit={async (input) => {
          await taskActions.update(task.id, input);
          toast.success('Tarefa atualizada');
        }}
      />
      <View>
        <Button label="Excluir tarefa" icon="trash-outline" variant="danger" onPress={remove} fullWidth />
      </View>
    </Screen>
  );
}
