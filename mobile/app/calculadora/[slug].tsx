import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useCalculatorProfile, useFavorites, usePatient } from '../../src/data/hooks';
import type { Patient } from '../../src/data/models';
import { autofillFromPatient } from '../../src/domain/autofill';
import {
  ageMatchesStage,
  fieldsAnsweredByProfile,
  profileFromPatient,
  profileValues,
  stageAgeRangeLabel,
  type CalculatorProfile,
} from '../../src/domain/calculatorProfile';
import { LIFE_STAGE_LABELS, LIFE_STAGE_PLURAL } from '../../src/domain/calculators/support/lifeStage';
import { IncompleteInputsError, type LifeStage } from '../../src/domain/calculators/types';
import { catalogEntry, catalogIcon, moduleInfo } from '../../src/domain/catalog';
import { computeLocally } from '../../src/domain/computeCalculation';
import { fieldHint, fieldLabel, optionLabel } from '../../src/domain/forms/fieldLabels';
import { missingFieldsMessage, parseCalculatorForm } from '../../src/domain/forms/parseForm';
import { isFieldActive, schemaToFields, type FieldDescriptor } from '../../src/domain/forms/schemaToFields';
import { CalculatorProfileCard } from '../../src/features/calculators/CalculatorProfileCard';
import { ResultCard } from '../../src/features/calculators/ResultCard';
import { LifeStageBadges } from '../../src/features/common/LifeStageBadge';
import { PatientPicker } from '../../src/features/patients/PatientPicker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Button } from '../../src/ui/Button';
import { Card } from '../../src/ui/Card';
import { ChipGroup } from '../../src/ui/Chips';
import { EmptyState } from '../../src/ui/EmptyState';
import { IconTile } from '../../src/ui/IconTile';
import { Screen } from '../../src/ui/Screen';
import { TextField } from '../../src/ui/TextField';
import { toast } from '../../src/ui/Toast';

export default function CalculatorScreen() {
  const { slug, patientId, consultationId, faixa } = useLocalSearchParams<{ slug: string; patientId?: string; consultationId?: string; faixa?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { consultations, calculations, settings } = useData();
  const { data: favoriteSlugs = [] } = useFavorites();
  const { data: initialPatient } = usePatient(patientId);
  const { profile: savedProfile, loading: profileLoading, save: saveProfile } = useCalculatorProfile(slug);

  const entry = catalogEntry(slug);
  const fields = useMemo(() => (entry ? schemaToFields(entry.input_schema) : []), [entry]);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [autofilled, setAutofilled] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Vindo da escolha de público (aba Calculadoras), a faixa etária já está decidida;
  // o sexo continua sendo o guardado para esta calculadora.
  const hubStage = entry && faixa && entry.life_stages.includes(faixa as LifeStage) ? (faixa as LifeStage) : null;
  const savedForAudience: CalculatorProfile | null =
    savedProfile && hubStage && savedProfile.stage !== hubStage ? { ...savedProfile, stage: hubStage } : savedProfile;

  // Com paciente, o perfil vem da ficha; sem paciente, do perfil guardado desta calculadora.
  const profile: CalculatorProfile | null = patient ? profileFromPatient(patient) : savedForAudience;

  useEffect(() => {
    if (savedProfile && hubStage && savedProfile.stage !== hubStage) void saveProfile({ ...savedProfile, stage: hubStage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubStage, savedProfile?.stage]);

  useEffect(() => {
    if (initialPatient) void selectPatient(initialPatient);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPatient?.id]);

  // O perfil responde ao campo "sexo" do método (e a qualquer outro que ele cubra).
  useEffect(() => {
    if (!entry || !profile) return;
    const injected = profileValues(entry.input_schema, profile);
    setValues((current) => ({ ...current, ...injected }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.slug, profile?.stage, profile?.sex]);

  const parsed = useMemo(() => parseCalculatorForm(fields, values), [fields, values]);

  // Tudo é calculado no aparelho, em tempo real, a cada tecla — sem internet.
  const { outcome, problem } = useMemo(() => {
    if (!parsed.complete) return { outcome: null, problem: null };
    try {
      return { outcome: computeLocally(slug, parsed.inputs), problem: null };
    } catch (error) {
      return { outcome: null, problem: error instanceof IncompleteInputsError ? error.message : null };
    }
  }, [parsed, slug]);

  if (!entry) {
    return (
      <Screen back title="Calculadora">
        <EmptyState icon="alert-circle-outline" title="Calculadora não encontrada" />
      </Screen>
    );
  }

  async function selectPatient(selected: Patient | null) {
    setPatient(selected);
    setSavedId(null);
    if (!selected) {
      setValues({});
      setAutofilled(new Set());
      return;
    }
    const measurements = await consultations.latestMeasurements(selected.id);
    const filled = autofillFromPatient(entry!.input_schema, selected, measurements);
    setValues((current) => ({ ...current, ...filled }));
    setAutofilled(new Set(Object.keys(filled)));
  }

  const setValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setAutofilled((current) => {
      const next = new Set(current);
      next.delete(name);
      return next;
    });
    setSavedId(null);
  };

  const save = async () => {
    if (!outcome) return;
    setSaving(true);
    try {
      const id = await calculations.create({
        patient_id: patient?.id ?? null,
        consultation_id: consultationId ?? null,
        calculator_slug: slug,
        calculator_name: entry.name,
        inputs: parsed.inputs,
        values: outcome.values,
        classification: outcome.classification,
        formula_version: outcome.formulaVersion,
      });
      setSavedId(id);
      toast.success(patient ? 'Salvo na ficha do paciente' : 'Salvo no histórico');
    } finally {
      setSaving(false);
    }
  };

  const favorite = favoriteSlugs.includes(slug);
  const module = moduleInfo(entry.module);
  const answeredByProfile = fieldsAnsweredByProfile(entry.input_schema);
  const visibleFields = fields.filter((field) => isFieldActive(field, values) && !(profile && answeredByProfile.includes(field.name)));
  const patientOutsideStages = patient && profile && !entry.life_stages.includes(profile.stage);

  const ageWarning = (field: FieldDescriptor): string | undefined => {
    if (field.name !== 'age_years' || !profile) return undefined;
    const age = parsed.inputs.age_years;
    if (typeof age !== 'number') return `${LIFE_STAGE_LABELS[profile.stage]}: ${stageAgeRangeLabel(profile.stage)}.`;
    return ageMatchesStage(age, profile.stage)
      ? undefined
      : `Atenção: fora da faixa escolhida (${LIFE_STAGE_LABELS[profile.stage]}, ${stageAgeRangeLabel(profile.stage)}). Confira o perfil.`;
  };

  return (
    <Screen
      back
      title={entry.name}
      subtitle={`${module?.label ?? ''} · ${entry.short_description}`}
      right={
        <Pressable accessibilityLabel="Favoritar" onPress={() => settings.toggleFavorite(slug)} hitSlop={12}>
          <Ionicons name={favorite ? 'star' : 'star-outline'} size={24} color={favorite ? colors.accent : colors.textSubtle} />
        </Pressable>
      }
    >
      {!profileLoading && (
        <CalculatorProfileCard
          entry={entry}
          patient={patient}
          saved={savedForAudience}
          preferredStage={hubStage}
          onSave={saveProfile}
          onPickPatient={() => setPickerOpen(true)}
          onClearPatient={() => void selectPatient(null)}
        />
      )}

      {patientOutsideStages && (
        <Card style={{ backgroundColor: colors.warningSoft, borderColor: colors.warning, flexDirection: 'row', gap: 10 }}>
          <Ionicons name="warning-outline" size={22} color={colors.warning} />
          <AppText style={{ flex: 1 }} color={colors.warning}>
            Este método é validado para {entry.life_stages.map((s) => LIFE_STAGE_PLURAL[s]).join(' e ')}, e o paciente é{' '}
            {LIFE_STAGE_LABELS[profile!.stage].toLowerCase()}. Considere outro método.
          </AppText>
        </Card>
      )}

      {profile && (
        <>
          <Card style={{ gap: 16 }}>
            <AppText variant="overline" tone="muted">
              Dados do cálculo
            </AppText>
            {visibleFields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={values[field.name] ?? ''}
                error={parsed.errors[field.name]}
                note={ageWarning(field)}
                autofilled={autofilled.has(field.name)}
                onChange={(value) => setValue(field.name, value)}
              />
            ))}

          </Card>

          {outcome ? (
            <View style={{ gap: 12 }}>
              <ResultCard outcome={outcome} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button
                  label={savedId ? 'Salvo ✓' : patient ? 'Salvar na ficha' : 'Salvar no histórico'}
                  icon="save-outline"
                  onPress={save}
                  loading={saving}
                  disabled={!!savedId}
                  style={{ flex: 1 }}
                />
                {savedId && patient && (
                  <Button label="Ver ficha" variant="secondary" onPress={() => router.push(`/paciente/${patient.id}`)} style={{ flex: 1 }} />
                )}
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
              <Ionicons name={problem ? 'alert-circle-outline' : 'information-circle-outline'} size={18} color={problem ? colors.warning : colors.textSubtle} />
              <AppText variant="caption" color={problem ? colors.warning : undefined} tone="muted" style={{ flex: 1 }}>
                {problem ?? missingFieldsMessage(fields, parsed.inputs) ?? 'Corrija os campos destacados.'}
                {problem ? '' : ' O resultado aparece sozinho.'}
              </AppText>
            </View>
          )}
        </>
      )}

      <Card padded={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: aboutOpen }}
          onPress={() => setAboutOpen((open) => !open)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}
        >
          <IconTile name={catalogIcon(entry)} size={32} />
          <AppText variant="bodyStrong" style={{ flex: 1 }}>
            Sobre o método e referência
          </AppText>
          <Ionicons name={aboutOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSubtle} />
        </Pressable>
        {aboutOpen && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
            <AppText variant="caption">{entry.formula_reference}</AppText>
            <AppText variant="small" tone="subtle">
              Validado para:
            </AppText>
            <LifeStageBadges stages={entry.life_stages} />
          </View>
        )}
      </Card>

      <PatientPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={selectPatient} />
    </Screen>
  );
}

function FieldInput({
  field, value, error, note, autofilled, onChange,
}: { field: FieldDescriptor; value: string; error?: string; note?: string; autofilled: boolean; onChange: (value: string) => void }) {
  // Campos condicionais só são exibidos quando a condição vale — e aí são obrigatórios.
  const label = `${fieldLabel(field.name)}${field.required || field.requiredIf ? ' *' : ''}`;
  const hint = [autofilled ? 'Preenchido a partir da ficha' : fieldHint(field.name), note].filter(Boolean).join(' ') || undefined;

  if (field.type === 'select' || field.type === 'boolean') {
    const options =
      field.type === 'boolean'
        ? [
            { value: 'false', label: 'Não' },
            { value: 'true', label: 'Sim' },
          ]
        : (field.options ?? []).map((option) => ({ value: option, label: optionLabel(option) }));

    return (
      <View style={{ gap: 6 }}>
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>
        <ChipGroup options={options} value={value || null} onChange={onChange} />
        {hint && (
          <AppText variant="small" tone="subtle">
            {hint}
          </AppText>
        )}
      </View>
    );
  }

  return (
    <TextField
      label={label}
      value={value.replace('.', ',')}
      onChangeText={onChange}
      keyboardType={field.type === 'number' ? 'decimal-pad' : 'default'}
      error={error}
      hint={hint}
    />
  );
}
