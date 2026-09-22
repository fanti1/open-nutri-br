import { useState } from 'react';
import { Platform, View } from 'react-native';
import type { Patient } from '../../data/models';
import type { AppointmentInput } from '../../data/repositories/appointments';
import { AppText } from '../../ui/AppText';
import { Button } from '../../ui/Button';
import { ChipGroup } from '../../ui/Chips';
import { DateTimeField } from '../../ui/DateTimeField';
import { ListItem } from '../../ui/ListItem';
import { TextField } from '../../ui/TextField';
import { Avatar } from '../../ui/Avatar';
import { PatientPicker } from '../patients/PatientPicker';

interface AppointmentFormProps {
  initial?: Partial<AppointmentInput> & { patient_name?: string | null };
  submitLabel: string;
  onSubmit: (input: AppointmentInput) => Promise<void>;
}

const DURATIONS = ['30', '45', '60', '90'] as const;
const REMINDERS = [
  { value: 'none', label: 'Sem lembrete' },
  { value: '15', label: '15 min antes' },
  { value: '60', label: '1 hora antes' },
  { value: '1440', label: '1 dia antes' },
] as const;

export function AppointmentForm({ initial, submitLabel, onSubmit }: AppointmentFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [startsAt, setStartsAt] = useState<Date | null>(initial?.starts_at ? new Date(initial.starts_at) : null);
  const [duration, setDuration] = useState(String(initial?.duration_minutes ?? 60));
  const [reminder, setReminder] = useState(initial?.reminder_minutes != null ? String(initial.reminder_minutes) : initial ? 'none' : '60');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [patient, setPatient] = useState<{ id: string; name: string } | null>(
    initial?.patient_id ? { id: initial.patient_id, name: initial.patient_name ?? 'Paciente' } : null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const effectiveTitle = title.trim() || (patient ? `Atendimento — ${patient.name}` : '');

  const submit = async () => {
    setTouched(true);
    if (!effectiveTitle || !startsAt) return;
    setSaving(true);
    try {
      await onSubmit({
        title: effectiveTitle,
        patient_id: patient?.id ?? null,
        starts_at: startsAt.toISOString(),
        duration_minutes: Number(duration),
        location: location.trim() || null,
        notes: notes.trim() || null,
        reminder_minutes: reminder === 'none' ? null : Number(reminder),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 6 }}>
        <AppText variant="caption" tone="muted">
          Paciente (opcional)
        </AppText>
        <ListItem
          title={patient?.name ?? 'Selecionar paciente'}
          subtitle={patient ? 'Toque para trocar' : 'Compromissos pessoais podem ficar sem paciente'}
          left={patient ? <Avatar name={patient.name} size={36} /> : undefined}
          onPress={() => setPickerOpen(true)}
        />
      </View>

      <TextField
        label={patient ? 'Título (opcional)' : 'Título *'}
        value={title}
        onChangeText={setTitle}
        placeholder={patient ? `Atendimento — ${patient.name}` : 'Ex.: Retorno, reunião, visita domiciliar'}
        error={touched && !effectiveTitle ? 'Informe um título ou selecione um paciente.' : null}
      />
      <DateTimeField label="Data e hora *" value={startsAt} onChange={setStartsAt} mode="datetime" />
      {touched && !startsAt && (
        <AppText variant="small" tone="danger">
          Informe data e hora.
        </AppText>
      )}

      <View style={{ gap: 6 }}>
        <AppText variant="caption" tone="muted">
          Duração
        </AppText>
        <ChipGroup options={DURATIONS.map((d) => ({ value: d, label: `${d} min` }))} value={duration} onChange={setDuration} />
      </View>

      <View style={{ gap: 6 }}>
        <AppText variant="caption" tone="muted">
          Lembrete
        </AppText>
        <ChipGroup options={[...REMINDERS]} value={reminder} onChange={setReminder} />
        {Platform.OS === 'web' && reminder !== 'none' && (
          <AppText variant="small" tone="subtle">
            A notificação toca no celular; no navegador o compromisso aparece no painel Início.
          </AppText>
        )}
      </View>

      <TextField label="Local" value={location} onChangeText={setLocation} icon="location-outline" placeholder="Consultório, online, domicílio..." />
      <TextField label="Observações" value={notes} onChangeText={setNotes} multiline />

      <Button label={submitLabel} onPress={submit} loading={saving} fullWidth />

      <PatientPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(p: Patient | null) => setPatient(p ? { id: p.id, name: p.name } : null)} />
    </View>
  );
}
