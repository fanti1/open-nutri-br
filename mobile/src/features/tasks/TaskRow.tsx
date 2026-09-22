import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import type { Task } from '../../data/models';
import { formatTime, relativeDay } from '../../lib/format';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Checkbox } from '../../ui/Checkbox';

interface TaskRowProps {
  task: Task & { patient_name?: string | null };
  onToggle: () => void;
  onPress: () => void;
}

/** Item do checklist: marcar como feito direto na lista; prazo vencido em vermelho. */
export function TaskRow({ task, onToggle, onPress }: TaskRowProps) {
  const { colors } = useTheme();
  const done = task.done === 1;
  const overdue = !done && task.due_at !== null && new Date(task.due_at) < new Date();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}>
      <Checkbox checked={done} onToggle={onToggle} label={task.title} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="body" tone={done ? 'subtle' : 'default'} style={{ textDecorationLine: done ? 'line-through' : 'none' }} numberOfLines={2}>
          {task.title}
        </AppText>
        {(task.due_at || task.remind_at) && !done && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {task.due_at && (
              <AppText variant="small" color={overdue ? colors.danger : colors.textMuted}>
                {overdue ? 'Atrasada · ' : 'Prazo · '}
                {relativeDay(task.due_at)} {formatTime(task.due_at)}
              </AppText>
            )}
            {task.remind_at && <Ionicons name="notifications-outline" size={13} color={colors.accent} />}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
    </Pressable>
  );
}
