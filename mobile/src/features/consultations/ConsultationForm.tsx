import { useState } from 'react';
import { View } from 'react-native';
import type { Consultation, ConsultationKind } from '../../data/models';
import type { ConsultationInput } from '../../data/repositories/consultations';
import { parseDecimal } from '../../domain/forms/parseForm';
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

const MEASURES: { key: keyof ConsultationInput; label: string; unit: string }[] = [
  { key: 'weight_kg', label: 'Peso', unit: 'kg' },
  { key: 'height_cm', label: 'Estatura/comprimento', unit: 'cm' },
  { key: 'waist_cm', label: 'Cintura', unit: 'cm' },
  { key: 'hip_cm', label: 'Quadril', unit: 'cm' },
  { key: 'head_circumference_cm', label: 'Perímetro cefálico', unit: 'cm' },
];

function toText(value: number | null | undefined): string {
  return value == null ? '' : String(value).replace('.', ',');
}

/** Vazio = não medido (null); texto que não é um número positivo = erro no campo (undefined). */
function toMeasure(text: string): number | null | undefined {
  if (!text.trim()) return null;
  const value = parseDecimal(text);
  return value !== null && value > 0 ? value : undefined;
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

  // Uma medida digitada errado não pode sumir em silêncio: ela alimenta as calculadoras.
  const parsed = Object.fromEntries(MEASURES.map((m) => [m.key, toMeasure(measures[m.key])])) as Record<string, number | null | undefined>;
  const invalid = MEASURES.some((m) => parsed[m.key] === undefined);

  const submit = async () => {
    if (!occurredAt || invalid) return;
    setSaving(true);
    try {
      await onSubmit({
        patient_id: patientId,
        occurred_at: occurredAt.toISOString(),
        kind,
        complaint: complaint.trim() || null,
        notes: notes.trim() || null,
        plan: plan.trim() || null,
        weight_kg: parsed.weight_kg ?? null,
        height_cm: parsed.height_cm ?? null,
        waist_cm: parsed.waist_cm ?? null,
        hip_cm: parsed.hip_cm ?? null,
        head_circumference_cm: parsed.head_circumference_cm ?? null,
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
              error={parsed[measure.key] === undefined ? 'Digite um número maior que zero.' : null}
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

      <Button label="Salvar atendimento" onPress={submit} loading={saving} disabled={invalid} fullWidth />
    </View>
  );
}
