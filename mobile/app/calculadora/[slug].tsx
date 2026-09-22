import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ApiError } from '../../src/api/client';
import { useData } from '../../src/data/DataProvider';
import { useFavorites, usePatient } from '../../src/data/hooks';
import type { Patient } from '../../src/data/models';
import { autofillFromPatient } from '../../src/domain/autofill';
import { LIFE_STAGE_LABELS } from '../../src/domain/calculators/support/lifeStage';
import { IncompleteInputsError, type CalculationOutcome } from '../../src/domain/calculators/types';
import { catalogEntry, catalogIcon } from '../../src/domain/catalog';
import { computeCalculation, computeLocally, isLocalCalculator } from '../../src/domain/computeCalculation';
import { fieldHint, fieldLabel, optionLabel } from '../../src/domain/forms/fieldLabels';
import { missingFieldsMessage, parseCalculatorForm } from '../../src/domain/forms/parseForm';
import { schemaToFields, type FieldDescriptor } from '../../src/domain/forms/schemaToFields';
import { ResultCard } from '../../src/features/calculators/ResultCard';
import { LifeStageBadges } from '../../src/features/common/LifeStageBadge';
import { patientLifeStage } from '../../src/features/patients/patientHelpers';
import { PatientPicker } from '../../src/features/patients/PatientPicker';
import { formatAge } from '../../src/lib/format';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Avatar } from '../../src/ui/Avatar';
import { Button } from '../../src/ui/Button';
import { Card } from '../../src/ui/Card';
import { ChipGroup } from '../../src/ui/Chips';
import { EmptyState } from '../../src/ui/EmptyState';
import { IconTile } from '../../src/ui/IconTile';
import { ListItem } from '../../src/ui/ListItem';
import { Screen } from '../../src/ui/Screen';
import { TextField } from '../../src/ui/TextField';
import { toast } from '../../src/ui/Toast';

export default function CalculatorScreen() {
  const { slug, patientId, consultationId } = useLocalSearchParams<{ slug: string; patientId?: string; consultationId?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { consultations, calculations, settings } = useData();
  const { data: favoriteSlugs = [] } = useFavorites();
  const { data: initialPatient } = usePatient(patientId);

  const entry = catalogEntry(slug);
  const fields = useMemo(() => (entry ? schemaToFields(entry.input_schema) : []), [entry]);
  const local = isLocalCalculator(slug);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [autofilled, setAutofilled] = useState<Set<string>>(new Set());
  const [serverOutcome, setServerOutcome] = useState<CalculationOutcome | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialPatient) void selectPatient(initialPatient);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPatient?.id]);

  const parsed = useMemo(() => parseCalculatorForm(fields, values), [fields, values]);

  // Calculadoras locais: resultado em tempo real, a cada tecla.
  const { localOutcome, localProblem } = useMemo(() => {
    if (!local || !parsed.complete) return { localOutcome: null, localProblem: null };
    try {
      return { localOutcome: computeLocally(slug, parsed.inputs), localProblem: null };
    } catch (error) {
      return { localOutcome: null, localProblem: error instanceof IncompleteInputsError ? error.message : null };
    }
  }, [local, parsed, slug]);

  const outcome = local ? localOutcome : serverOutcome;

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
    setServerOutcome(null);
    setServerError(null);
    setSavedId(null);
  };

  const calculateOnServer = async () => {
    const missing = missingFieldsMessage(fields, parsed.inputs);
    if (missing || !parsed.complete) {
      setServerError(missing ?? 'Corrija os campos destacados.');
      return;
    }
    setCalculating(true);
    setServerError(null);
    try {
      setServerOutcome(await computeCalculation(slug, parsed.inputs));
    } catch (error) {
      setServerOutcome(null);
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível calcular.');
    } finally {
      setCalculating(false);
    }
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
  const stage = patient ? patientLifeStage(patient) : null;
  const notValidatedForPatient = stage !== null && !entry.life_stages.includes(stage);

  return (
    <Screen
      back
      title={entry.name}
      subtitle={entry.short_description}
      right={
        <Pressable accessibilityLabel="Favoritar" onPress={() => settings.toggleFavorite(slug)} hitSlop={12}>
          <Ionicons name={favorite ? 'star' : 'star-outline'} size={24} color={favorite ? colors.accent : colors.textSubtle} />
        </Pressable>
      }
    >
      <Card padded={false} style={{ paddingHorizontal: 16 }}>
        <ListItem
          title={patient ? patient.name : 'Calcular para um paciente'}
          subtitle={patient ? `${formatAge(patient.birth_date)} · dados da ficha preenchidos` : 'Opcional — preenche idade, sexo e últimas medidas'}
          left={patient ? <Avatar name={patient.name} size={38} /> : <IconTile name="person-add-outline" size={38} />}
          onPress={() => setPickerOpen(true)}
        />
      </Card>

      {notValidatedForPatient && (
        <Card style={{ backgroundColor: colors.warningSoft, borderColor: colors.warning, flexDirection: 'row', gap: 10 }}>
          <Ionicons name="warning-outline" size={22} color={colors.warning} />
          <AppText style={{ flex: 1 }} color={colors.warning}>
            Este método é validado para {entry.life_stages.map((s) => LIFE_STAGE_LABELS[s].toLowerCase()).join(' e ')}, e o paciente é{' '}
            {LIFE_STAGE_LABELS[stage!].toLowerCase()}. Considere outro método.
          </AppText>
        </Card>
      )}

      <View style={{ gap: 16 }}>
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={values[field.name] ?? ''}
            error={parsed.errors[field.name]}
            autofilled={autofilled.has(field.name)}
            onChange={(value) => setValue(field.name, value)}
          />
        ))}
      </View>

      {!local && (
        <View style={{ gap: 8 }}>
          <Button label="Calcular" icon="calculator" onPress={calculateOnServer} loading={calculating} fullWidth />
          <AppText variant="small" tone="subtle" align="center">
            Usa as tabelas oficiais da OMS no servidor — requer internet. Só as medidas são enviadas.
          </AppText>
        </View>
      )}

      {serverError && (
        <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.danger }}>
          <AppText color={colors.danger}>{serverError}</AppText>
        </Card>
      )}

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
        local && (
          <Card tone="alt">
            <AppText tone="muted" align="center">
              {missingFieldsMessage(fields, parsed.inputs) ?? localProblem ?? 'Corrija os campos destacados para ver o resultado.'}
            </AppText>
          </Card>
        )
      )}

      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconTile name={catalogIcon(entry)} size={32} />
          <AppText variant="overline" tone="muted">
            Referência científica
          </AppText>
        </View>
        <AppText variant="caption">{entry.formula_reference}</AppText>
        <AppText variant="small" tone="subtle">
          Validado para:
        </AppText>
        <LifeStageBadges stages={entry.life_stages} />
      </Card>

      <PatientPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={selectPatient} />
    </Screen>
  );
}

function FieldInput({
  field, value, error, autofilled, onChange,
}: { field: FieldDescriptor; value: string; error?: string; autofilled: boolean; onChange: (value: string) => void }) {
  const label = `${fieldLabel(field.name)}${field.required ? ' *' : ''}`;
  const hint = autofilled ? 'Preenchido a partir da ficha' : fieldHint(field.name);

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
