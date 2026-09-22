import { useState } from 'react';
import { View } from 'react-native';
import type { Patient } from '../../data/models';
import type { TaskInput } from '../../data/repositories/tasks';
import { AppText } from '../../ui/AppText';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { ChipGroup } from '../../ui/Chips';
import { DateTimeField } from '../../ui/DateTimeField';
import { ListItem } from '../../ui/ListItem';
import { TextField } from '../../ui/TextField';
import { PatientPicker } from '../patients/PatientPicker';

type ReminderChoice = 'none' | 'at_due' | '60' | '1440' | 'custom';

interface TaskFormProps {
  initial?: Partial<TaskInput> & { patient_name?: string | null };
  submitLabel: string;
  onSubmit: (input: TaskInput) => Promise<void>;
}

function initialReminder(initial?: Partial<TaskInput>): ReminderChoice {
  if (!initial?.remind_at) return 'none';
  if (initial.due_at === initial.remind_at) return 'at_due';
  return 'custom';
}

export function TaskForm({ initial, submitLabel, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [dueAt, setDueAt] = useState<Date | null>(initial?.due_at ? new Date(initial.due_at) : null);
  const [reminder, setReminder] = useState<ReminderChoice>(initialReminder(initial));
  const [customReminder, setCustomReminder] = useState<Date | null>(initial?.remind_at ? new Date(initial.remind_at) : null);
  const [patient, setPatient] = useState<{ id: string; name: string } | null>(
    initial?.patient_id ? { id: initial.patient_id, name: initial.patient_name ?? 'Paciente' } : null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const remindAt = (): Date | null => {
    if (reminder === 'none') return null;
    if (reminder === 'custom') return customReminder;
    if (!dueAt) return null;
    return reminder === 'at_due' ? dueAt : new Date(dueAt.getTime() - Number(reminder) * 60_000);
  };

  const submit = async () => {
    setTouched(true);
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        title,
        notes: notes.trim() || null,
        due_at: dueAt?.toISOString() ?? null,
        remind_at: remindAt()?.toISOString() ?? null,
        patient_id: patient?.id ?? null,
      });
    } finally {
      setSaving(false);
    }
  };

  const reminderOptions = dueAt
    ? [
        { value: 'none' as const, label: 'Sem lembrete' },
        { value: 'at_due' as const, label: 'No prazo' },
        { value: '60' as const, label: '1 h antes' },
        { value: '1440' as const, label: '1 dia antes' },
        { value: 'custom' as const, label: 'Outro horário' },
      ]
    : [
        { value: 'none' as const, label: 'Sem lembrete' },
        { value: 'custom' as const, label: 'Escolher horário' },
      ];

  return (
    <View style={{ gap: 16 }}>
      <TextField label="Tarefa *" value={title} onChangeText={setTitle} placeholder="Ex.: Enviar plano alimentar da Maria" error={touched && !title.trim() ? 'Descreva a tarefa.' : null} />
      <DateTimeField label="Prazo" value={dueAt} onChange={setDueAt} mode="datetime" clearable placeholder="Sem prazo" />

      <View style={{ gap: 6 }}>
        <AppText variant="caption" tone="muted">
          Lembrete
        </AppText>
        <ChipGroup options={reminderOptions} value={reminderOptions.some((o) => o.value === reminder) ? reminder : 'none'} onChange={setReminder} />
      </View>
      {reminder === 'custom' && <DateTimeField label="Lembrar em" value={customReminder} onChange={setCustomReminder} mode="datetime" />}

      <View style={{ gap: 6 }}>
        <AppText variant="caption" tone="muted">
          Paciente relacionado (opcional)
        </AppText>
        <ListItem
          title={patient?.name ?? 'Nenhum'}
          left={patient ? <Avatar name={patient.name} size={32} /> : undefined}
          onPress={() => setPickerOpen(true)}
        />
      </View>

      <TextField label="Detalhes" value={notes} onChangeText={setNotes} multiline />
      <Button label={submitLabel} onPress={submit} loading={saving} fullWidth />

      <PatientPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(p: Patient | null) => setPatient(p ? { id: p.id, name: p.name } : null)} />
    </View>
  );
}
