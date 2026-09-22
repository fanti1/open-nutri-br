import { useState } from 'react';
import { View } from 'react-native';
import type { Sex } from '../../data/models';
import type { PatientInput } from '../../data/repositories/patients';
import { parseDate, toDateOnly } from '../../lib/format';
import { AppText } from '../../ui/AppText';
import { Button } from '../../ui/Button';
import { ChipGroup } from '../../ui/Chips';
import { DateTimeField } from '../../ui/DateTimeField';
import { TextField } from '../../ui/TextField';

interface PatientFormProps {
  initial?: Partial<PatientInput>;
  submitLabel: string;
  onSubmit: (input: PatientInput) => Promise<void>;
}

/** Dados cadastrais da ficha. Data de nascimento e sexo são obrigatórios porque as fórmulas dependem deles. */
export function PatientForm({ initial, submitLabel, onSubmit }: PatientFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [birthDate, setBirthDate] = useState<Date | null>(initial?.birth_date ? parseDate(initial.birth_date) : null);
  const [sex, setSex] = useState<Sex | null>(initial?.sex ?? null);
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [cpf, setCpf] = useState(initial?.cpf ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = {
    name: !name.trim() ? 'Informe o nome.' : null,
    birthDate: !birthDate ? 'Informe a data de nascimento.' : birthDate > new Date() ? 'A data não pode ser no futuro.' : null,
    sex: !sex ? 'Selecione o sexo.' : null,
  };
  const valid = !errors.name && !errors.birthDate && !errors.sex;

  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    setSaving(true);
    try {
      await onSubmit({
        name,
        birth_date: toDateOnly(birthDate!),
        sex: sex!,
        phone: phone.trim() || null,
        email: email.trim() || null,
        cpf: cpf.trim() || null,
        notes: notes.trim() || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <TextField label="Nome completo *" value={name} onChangeText={setName} error={touched ? errors.name : null} autoCapitalize="words" />
      <DateTimeField label="Data de nascimento *" value={birthDate} onChange={setBirthDate} />
      {touched && errors.birthDate && <AppText variant="small" tone="danger">{errors.birthDate}</AppText>}
      <View style={{ gap: 6 }}>
        <AppText variant="caption" tone="muted">
          Sexo *
        </AppText>
        <ChipGroup
          options={[
            { value: 'female', label: 'Feminino' },
            { value: 'male', label: 'Masculino' },
          ]}
          value={sex}
          onChange={setSex}
        />
        {touched && errors.sex && <AppText variant="small" tone="danger">{errors.sex}</AppText>}
      </View>
      <TextField label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon="call-outline" />
      <TextField label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" icon="mail-outline" />
      <TextField label="CPF" value={cpf} onChangeText={setCpf} keyboardType="number-pad" hint="Opcional." />
      <TextField label="Observações / anamnese resumida" value={notes} onChangeText={setNotes} multiline />
      <Button label={submitLabel} onPress={submit} loading={saving} fullWidth />
    </View>
  );
}
