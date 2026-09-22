import { useState } from 'react';
import { View } from 'react-native';
import type { Consultation, ConsultationKind } from '../../data/models';
import type { ConsultationInput } from '../../data/repositories/consultations';
import { AppText } from '../../ui/AppText';
import { Button } from '../../ui/Button';
import { ChipGroup } from '../../ui/Chips';
import { DateTimeField } from '../../ui/DateTimeField';
import { TextField } from '../../ui/TextField';

interface ConsultationFormProps {
  patientId: string;
  initial?: Consultation | null;
  onSubmit: (input: ConsultationInput) => Promise<void>;
}

const MEASURES: Array<{ key: keyof ConsultationInput; label: string; unit: string }> = [
  { key: 'weight_kg', label: 'Peso', unit: 'kg' },
  { key: 'height_cm', label: 'Estatura/comprimento', unit: 'cm' },
  { key: 'waist_cm', label: 'Cintura', unit: 'cm' },
  { key: 'hip_cm', label: 'Quadril', unit: 'cm' },
  { key: 'head_circumference_cm', label: 'Perímetro cefálico', unit: 'cm' },
];

function toText(value: number | null | undefined): string {
  return value == null ? '' : String(value).replace('.', ',');
}

function toNumber(text: string): number | null {
  const value = Number(text.trim().replace(',', '.'));
  return text.trim() && Number.isFinite(value) && value > 0 ? value : null;
}

/** Registro do atendimento: motivo, evolução, conduta e as medidas do dia (que alimentam as calculadoras). */
export function ConsultationForm({ patientId, initial, onSubmit }: ConsultationFormProps) {
  const [occurredAt, setOccurredAt] = useState<Date | null>(initial ? new Date(initial.occurred_at) : new Date());
  const [kind, setKind] = useState<ConsultationKind>(initial?.kind ?? 'consulta');
  const [complaint, setComplaint] = useState(initial?.complaint ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [plan, setPlan] = useState(initial?.plan ?? '');
  const [measures, setMeasures] = useState<Record<string, string>>(
    Object.fromEntries(MEASURES.map((m) => [m.key, toText(initial?.[m.key as keyof Consultation] as number | null)])),
  );
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!occurredAt) return;
    setSaving(true);
    try {
      await onSubmit({
        patient_id: patientId,
        occurred_at: occurredAt.toISOString(),
        kind,
        complaint: complaint.trim() || null,
        notes: notes.trim() || null,
        plan: plan.trim() || null,
        weight_kg: toNumber(measures.weight_kg),
        height_cm: toNumber(measures.height_cm),
        waist_cm: toNumber(measures.waist_cm),
        hip_cm: toNumber(measures.hip_cm),
        head_circumference_cm: toNumber(measures.head_circumference_cm),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <DateTimeField label="Data e hora" value={occurredAt} onChange={setOccurredAt} mode="datetime" />
      <ChipGroup
        options={[
          { value: 'consulta', label: 'Consulta' },
          { value: 'retorno', label: 'Retorno' },
          { value: 'avaliacao', label: 'Avaliação' },
        ]}
        value={kind}
        onChange={setKind}
      />

      <AppText variant="overline" tone="muted">
        Medidas do dia
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {MEASURES.map((measure) => (
          <View key={measure.key} style={{ flexGrow: 1, flexBasis: '45%' }}>
            <TextField
              label={measure.label}
              unit={measure.unit}
              keyboardType="decimal-pad"
              value={measures[measure.key]}
              onChangeText={(text) => setMeasures((current) => ({ ...current, [measure.key]: text }))}
            />
          </View>
        ))}
      </View>

      <AppText variant="overline" tone="muted">
        Registro clínico
      </AppText>
      <TextField label="Motivo / queixa principal" value={complaint} onChangeText={setComplaint} multiline />
      <TextField label="Evolução e observações" value={notes} onChangeText={setNotes} multiline />
      <TextField label="Conduta / plano alimentar" value={plan} onChangeText={setPlan} multiline />

      <Button label="Salvar atendimento" onPress={submit} loading={saving} fullWidth />
    </View>
  );
}
