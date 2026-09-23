import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { Patient } from '../../data/models';
import {
  initialDraft,
  isCompleteProfile,
  profileFromPatient,
  STAGES,
  stageAgeRangeLabel,
  type CalculatorProfile,
  type ProfileSex,
} from '../../domain/calculatorProfile';
import { LIFE_STAGE_LABELS, LIFE_STAGE_PLURAL, LIFE_STAGE_SHORT_LABELS } from '../../domain/calculators/support/lifeStage';
import type { LifeStage } from '../../domain/calculators/types';
import type { CatalogEntry } from '../../domain/catalog';
import { formatAge } from '../../lib/format';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Segmented } from '../../ui/Chips';
import { IconTile } from '../../ui/IconTile';
import { sexLabel } from '../patients/patientHelpers';

const STAGE_COLOR_KEY = { crianca: 'child', adulto: 'adult', idoso: 'elderly' } as const;

interface CalculatorProfileCardProps {
  entry: Pick<CatalogEntry, 'life_stages'>;
  /** Paciente vinculado — quando existe, o perfil vem da ficha. */
  patient: Patient | null;
  /** Perfil avulso já guardado para esta calculadora. */
  saved: CalculatorProfile | null;
  onSave: (profile: CalculatorProfile) => void;
  onPickPatient: () => void;
  onClearPatient: () => void;
}

/**
 * "Para quem é o cálculo?" — faixa etária e sexo, escolhidos uma vez por
 * calculadora e guardados, ou herdados da ficha de um paciente.
 */
export function CalculatorProfileCard({ entry, patient, saved, onSave, onPickPatient, onClearPatient }: CalculatorProfileCardProps) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<CalculatorProfile>>(() => saved ?? initialDraft(entry));

  useEffect(() => {
    if (saved) setDraft(saved);
  }, [saved?.stage, saved?.sex]);

  if (patient) {
    const profile = profileFromPatient(patient);
    return (
      <Card style={{ gap: 12 }}>
        <Header title="Para quem é o cálculo" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={patient.name} size={42} />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {patient.name}
            </AppText>
            <ProfileLine profile={profile} extra={formatAge(patient.birth_date)} />
            <AppText variant="small" tone="subtle">
              Idade, sexo e últimas medidas vêm da ficha
            </AppText>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Trocar paciente" size="sm" variant="secondary" icon="swap-horizontal" onPress={onPickPatient} style={{ flex: 1 }} />
          <Button label="Perfil avulso" size="sm" variant="ghost" icon="close" onPress={onClearPatient} style={{ flex: 1 }} />
        </View>
      </Card>
    );
  }

  if (saved && !editing) {
    return (
      <Card style={{ gap: 12 }}>
        <Header title="Para quem é o cálculo" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconTile name="person-outline" size={42} color={colors[STAGE_COLOR_KEY[saved.stage]]} />
          <View style={{ flex: 1, gap: 2 }}>
            <ProfileLine profile={saved} large />
            <AppText variant="small" tone="subtle">
              Perfil salvo para esta calculadora
            </AppText>
          </View>
          <Button label="Alterar" size="sm" variant="secondary" onPress={() => setEditing(true)} />
        </View>
        <PatientLink onPress={onPickPatient} />
      </Card>
    );
  }

  const firstTime = !saved;
  const disabledStages = STAGES.filter((stage) => !entry.life_stages.includes(stage));

  const confirm = () => {
    if (!isCompleteProfile(draft)) return;
    onSave(draft);
    setEditing(false);
  };

  return (
    <Card style={{ gap: 16, borderColor: firstTime ? colors.primary : colors.border, borderWidth: firstTime ? 1.5 : 1 }}>
      <View style={{ gap: 4 }}>
        <Header title="Para quem é o cálculo?" />
        <AppText variant="caption" tone="muted">
          {firstTime
            ? 'Escolha a faixa etária e o sexo. Fica salvo para esta calculadora — você só escolhe de novo se quiser mudar.'
            : 'Altere a faixa etária ou o sexo deste cálculo.'}
        </AppText>
      </View>

      <View style={{ gap: 8 }}>
        <AppText variant="caption" tone="muted">
          Faixa etária
        </AppText>
        <Segmented<LifeStage>
          options={STAGES.map((stage) => ({
            value: stage,
            label: LIFE_STAGE_SHORT_LABELS[stage],
            color: colors[STAGE_COLOR_KEY[stage]],
            disabled: disabledStages.includes(stage),
          }))}
          value={draft.stage ?? null}
          onChange={(stage) => setDraft((current) => ({ ...current, stage }))}
        />
        <AppText variant="small" tone="subtle">
          {draft.stage ? `${LIFE_STAGE_LABELS[draft.stage]}: ${stageAgeRangeLabel(draft.stage)}.` : ''}
          {disabledStages.length > 0
            ? `${draft.stage ? ' ' : ''}Método não validado para ${disabledStages.map((s) => LIFE_STAGE_PLURAL[s]).join(' e ')}.`
            : ''}
        </AppText>
      </View>

      <View style={{ gap: 8 }}>
        <AppText variant="caption" tone="muted">
          Sexo
        </AppText>
        <Segmented<ProfileSex>
          options={[
            { value: 'female', label: 'Feminino' },
            { value: 'male', label: 'Masculino' },
          ]}
          value={draft.sex ?? null}
          onChange={(sex) => setDraft((current) => ({ ...current, sex }))}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {!firstTime && <Button label="Cancelar" variant="ghost" onPress={() => { setDraft(saved!); setEditing(false); }} style={{ flex: 1 }} />}
        <Button
          label={firstTime ? 'Usar este perfil' : 'Salvar perfil'}
          icon="checkmark"
          onPress={confirm}
          disabled={!isCompleteProfile(draft)}
          style={{ flex: 1 }}
        />
      </View>

      <PatientLink onPress={onPickPatient} />
    </Card>
  );
}

function Header({ title }: { title: string }) {
  return (
    <AppText variant="overline" tone="muted">
      {title}
    </AppText>
  );
}

function ProfileLine({ profile, extra, large }: { profile: CalculatorProfile; extra?: string; large?: boolean }) {
  const { colors } = useTheme();
  return (
    <AppText variant={large ? 'bodyStrong' : 'caption'} tone="muted">
      <AppText variant={large ? 'bodyStrong' : 'caption'} color={colors[STAGE_COLOR_KEY[profile.stage]]}>
        {LIFE_STAGE_LABELS[profile.stage]}
      </AppText>
      {` · ${sexLabel(profile.sex)}`}
      {extra ? ` · ${extra}` : ''}
    </AppText>
  );
}

function PatientLink({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name="people-outline" size={18} color={colors.primary} />
      <AppText variant="caption" tone="primary" style={{ flex: 1 }}>
        Calcular para um paciente cadastrado
      </AppText>
      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
    </Pressable>
  );
}
