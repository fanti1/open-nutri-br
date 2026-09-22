import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useData } from '../src/data/DataProvider';
import type { TaskFilter } from '../src/data/repositories/tasks';
import { useLiveQuery } from '../src/data/useLiveQuery';
import { TaskRow } from '../src/features/tasks/TaskRow';
import { AppText } from '../src/ui/AppText';
import { Card } from '../src/ui/Card';
import { Segmented } from '../src/ui/Chips';
import { EmptyState } from '../src/ui/EmptyState';
import { Fab } from '../src/ui/Fab';
import { Screen } from '../src/ui/Screen';
import { TextField } from '../src/ui/TextField';
import { toast } from '../src/ui/Toast';

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, taskActions } = useData();
  const [filter, setFilter] = useState<TaskFilter>('pendentes');
  const [quickTitle, setQuickTitle] = useState('');
  const { data = [], loading } = useLiveQuery(['tasks'], () => tasks.list(filter), [filter]);

  const quickAdd = async () => {
    if (!quickTitle.trim()) return;
    await taskActions.create({ title: quickTitle });
    setQuickTitle('');
    toast.success('Tarefa adicionada');
  };

  return (
    <Screen back title="Tarefas" subtitle="Seu checklist, com prazos e lembretes" floating={<Fab label="Nova tarefa" onPress={() => router.push('/tarefa/novo')} />}>
      <TextField value={quickTitle} onChangeText={setQuickTitle} placeholder="Adicionar tarefa rápida e tecle Enter" icon="add-circle-outline" onSubmitEditing={quickAdd} />

      <Segmented<TaskFilter>
        options={[
          { value: 'pendentes', label: 'Pendentes' },
          { value: 'concluidas', label: 'Concluídas' },
          { value: 'todas', label: 'Todas' },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {data.length > 0 && (
        <Card padded={false} style={{ paddingHorizontal: 16 }}>
          {data.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={() => taskActions.setDone(task.id, task.done === 0)} onPress={() => router.push(`/tarefa/${task.id}`)} />
          ))}
        </Card>
      )}

      {!loading && data.length === 0 && (
        <EmptyState
          icon={filter === 'concluidas' ? 'trophy-outline' : 'checkmark-done-outline'}
          title={filter === 'concluidas' ? 'Nada concluído ainda' : 'Nenhuma tarefa pendente'}
          message={filter === 'pendentes' ? 'Use o campo acima para anotar algo rapidamente.' : undefined}
        />
      )}

      {filter === 'pendentes' && data.length > 0 && (
        <AppText variant="small" tone="subtle" align="center">
          Toque no quadrado para concluir · toque na tarefa para editar prazo e lembrete
        </AppText>
      )}
    </Screen>
  );
}
