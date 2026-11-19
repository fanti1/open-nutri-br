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
import { AUDIT_STATUS_LABELS } from '../../src/domain/methodAudit';
import { missingFieldsMessage, parseCalculatorForm } from '../../src/domain/forms/parseForm';
import { isFieldActive, schemaToFields, type FieldDescriptor } from '../../src/domain/forms/schemaToFields';
import { CalculatorProfileCard } from '../../src/features/calculators/CalculatorProfileCard';
import { MethodAuditPanel } from '../../src/features/calculators/MethodAuditPanel';
import { ResultCard, ResultSummary } from '../../src/features/calculators/ResultCard';
import { LifeStageBadges } from '../../src/features/common/LifeStageBadge';
import { PatientPicker } from '../../src/features/patients/PatientPicker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { areaColors } from '../../src/theme/tokens';
import { AppText } from '../../src/ui/AppText';
import { Button } from '../../src/ui/Button';
import { Callout } from '../../src/ui/Callout';
import { Card } from '../../src/ui/Card';
import { ChipGroup } from '../../src/ui/Chips';
import { EmptyState } from '../../src/ui/EmptyState';
import { IconButton } from '../../src/ui/IconButton';
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
  const [typed, setValues] = useState<Record<string, string>>({});
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

  // O perfil responde ao campo "sexo" do método (e a qualquer outro que ele cubra);
  // esses campos ficam ocultos no formulário, então o perfil sempre prevalece.
  const profileStage = profile?.stage;
  const profileSex = profile?.sex;
  const values = useMemo(
    () => (entry && profileStage && profileSex ? { ...typed, ...profileValues(entry.input_schema, { stage: profileStage, sex: profileSex }) } : typed),
    [entry, typed, profileStage, profileSex],
  );

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
  const area = module ? areaColors(colors, module.colorKey) : undefined;
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

  const hasErrors = Object.keys(parsed.errors).length > 0;
  const guidance = problem ?? (hasErrors ? 'Corrija os campos destacados em vermelho.' : (missingFieldsMessage(fields, parsed.inputs) ?? 'Preencha os dados.'));
  const requiredFields = visibleFields.filter((field) => field.required || field.requiredIf);
  const requiredCount = requiredFields.length;
  const filledCount = requiredFields.filter((field) => parsed.inputs[field.name] !== undefined).length;

  // Barra fixa: o resultado (ou o que falta para ele) fica sempre à vista enquanto se digita.
  const footer = outcome ? (
    <>
      <ResultSummary outcome={outcome} />
      <Button
        label={savedId ? 'Salvo' : 'Salvar'}
        icon={savedId ? 'checkmark-circle' : 'save-outline'}
        accessibilityLabel={savedId ? 'Cálculo salvo' : patient ? 'Salvar na ficha do paciente' : 'Salvar no histórico'}
        onPress={save}
        loading={saving}
        disabled={!!savedId}
      />
    </>
  ) : (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 }} accessibilityLiveRegion="polite">
      <Ionicons
        name={problem || hasErrors ? 'alert-circle-outline' : 'calculator-outline'}
        size={22}
        color={problem || hasErrors ? colors.warning : colors.textSubtle}
      />
      <View style={{ flex: 1 }}>
        <AppText variant="caption" color={problem || hasErrors ? colors.warning : undefined} tone="muted" numberOfLines={3}>
          {guidance}
        </AppText>
        {!problem && !hasErrors && (
          <AppText variant="small" tone="subtle">
            O resultado aparece aqui assim que tudo estiver preenchido.
          </AppText>
        )}
      </View>
    </View>
  );

  return (
    <Screen
      back
      title={entry.name}
      subtitle={`${module?.label ?? ''} · ${entry.short_description}`}
      // Cabeçalho na cor da área (consultório coral, hospital azul, pediatria amarelo, exames violeta).
      hero={{ color: area?.fill, onColor: area?.onFill, overlap: 40 }}
      right={
        <IconButton
          icon={favorite ? 'star' : 'star-outline'}
          label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          selected={favorite}
          variant="onHero"
          color={area?.onFill}
          size={24}
          onPress={() => settings.toggleFavorite(slug)}
        />
      }
      footer={profile ? footer : undefined}
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

      {(entry.audit.status === 'pendente' || entry.audit.status === 'divergente') && (
        <AuditWarning status={entry.audit.status} summary={entry.audit.summary} onPress={() => setAboutOpen(true)} />
      )}

      {patientOutsideStages && (
        <Callout tone="warning" title="Método fora da faixa do paciente">
          {`Este método é validado para ${entry.life_stages.map((s) => LIFE_STAGE_PLURAL[s]).join(' e ')}, e o paciente é ${LIFE_STAGE_LABELS[profile!.stage].toLowerCase()}. Considere outro método.`}
        </Callout>
      )}

      {profile && (
        <>
          <Card style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <AppText variant="heading" accessibilityRole="header">
                Dados do cálculo
              </AppText>
              {requiredCount > 0 && (
                <AppText variant="small" tone={filledCount === requiredCount ? 'success' : 'subtle'}>
                  {filledCount} de {requiredCount} obrigatórios
                </AppText>
              )}
            </View>
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
              {savedId && patient && (
                <Button label="Ver na ficha do paciente" icon="person-outline" variant="secondary" onPress={() => router.push(`/paciente/${patient.id}`)} />
              )}
            </View>
          ) : null}
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
          <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 14 }}>
            <View style={{ gap: 10 }}>
              <AppText variant="caption">{entry.formula_reference}</AppText>
              <AppText variant="small" tone="subtle">
                Validado para:
              </AppText>
              <LifeStageBadges stages={entry.life_stages} />
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }}>
              <MethodAuditPanel entry={entry} />
            </View>
          </View>
        )}
      </Card>

      <PatientPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={selectPatient} />
    </Screen>
  );
}

/** Método com conferência pendente ou divergência na auditoria científica: avisar antes do uso. */
function AuditWarning({ status, summary, onPress }: { status: 'pendente' | 'divergente'; summary: string; onPress: () => void }) {
  return (
    <Callout
      tone={status === 'divergente' ? 'danger' : 'warning'}
      icon={status === 'divergente' ? 'warning-outline' : 'time-outline'}
      title={AUDIT_STATUS_LABELS[status]}
      actionLabel="Ver a auditoria do método"
      onPress={onPress}
    >
      {summary}
    </Callout>
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
        <AppText variant="label" tone="muted">
          {label}
        </AppText>
        <ChipGroup options={options} value={value || null} onChange={onChange} accessibilityLabel={label} />
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
