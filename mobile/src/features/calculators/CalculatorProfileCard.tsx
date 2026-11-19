import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
import { LIFE_STAGE_LABELS, LIFE_STAGE_PLURAL, LIFE_STAGE_SHORT_LABELS, STAGE_COLOR_KEY } from '../../domain/calculators/support/lifeStage';
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


interface CalculatorProfileCardProps {
  entry: Pick<CatalogEntry, 'life_stages'>;
  /** Paciente vinculado — quando existe, o perfil vem da ficha. */
  patient: Patient | null;
  /** Perfil avulso já guardado para esta calculadora. */
  saved: CalculatorProfile | null;
  /** Faixa já escolhida antes de abrir a calculadora (aba Calculadoras). */
  preferredStage?: LifeStage | null;
  onSave: (profile: CalculatorProfile) => void;
  onPickPatient: () => void;
  onClearPatient: () => void;
}

/**
 * "Para quem é o cálculo?" — faixa etária e sexo, escolhidos uma vez por
 * calculadora e guardados, ou herdados da ficha de um paciente.
 */
export function CalculatorProfileCard({ entry, patient, saved, preferredStage, onSave, onPickPatient, onClearPatient }: CalculatorProfileCardProps) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<CalculatorProfile>>(() => saved ?? { ...initialDraft(entry), ...(preferredStage ? { stage: preferredStage } : {}) });

  // Perfil salvo mudou (ex.: veio de outra tela): o rascunho acompanha.
  const savedKey = saved ? `${saved.stage}|${saved.sex}` : null;
  const [syncedKey, setSyncedKey] = useState(savedKey);
  if (savedKey !== syncedKey) {
    setSyncedKey(savedKey);
    if (saved) setDraft(saved);
  }

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

  // Na primeira vez não há o que confirmar: escolhidos faixa e sexo, o perfil já vale.
  const choose = (patch: Partial<CalculatorProfile>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (firstTime && isCompleteProfile(next)) onSave(next);
  };

  return (
    <Card style={{ gap: 16, borderColor: firstTime ? colors.primary : colors.border, borderWidth: firstTime ? 1.5 : 1 }}>
      <View style={{ gap: 4 }}>
        <Header title="Para quem é o cálculo?" />
        <AppText variant="caption" tone="muted">
          {!firstTime
            ? 'Altere a faixa etária ou o sexo deste cálculo.'
            : draft.stage
              ? 'Escolha o sexo para começar. Fica salvo para esta calculadora.'
              : 'Escolha a faixa etária e o sexo para começar. Fica salvo para esta calculadora.'}
        </AppText>
      </View>

      <View style={{ gap: 8 }}>
        <AppText variant="label" tone="muted">
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
          onChange={(stage) => choose({ stage })}
        />
        <AppText variant="small" tone="subtle">
          {draft.stage ? `${LIFE_STAGE_LABELS[draft.stage]}: ${stageAgeRangeLabel(draft.stage)}.` : ''}
          {disabledStages.length > 0
            ? `${draft.stage ? ' ' : ''}Método validado só para ${entry.life_stages.map((s) => LIFE_STAGE_PLURAL[s]).join(' e ')}.`
            : ''}
        </AppText>
      </View>

      <View style={{ gap: 8 }}>
        <AppText variant="label" tone="muted">
          Sexo
        </AppText>
        <Segmented<ProfileSex>
          options={[
            { value: 'female', label: 'Feminino' },
            { value: 'male', label: 'Masculino' },
          ]}
          value={draft.sex ?? null}
          onChange={(sex) => choose({ sex })}
        />
      </View>

      {!firstTime && (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Cancelar" variant="ghost" onPress={() => { setDraft(saved!); setEditing(false); }} style={{ flex: 1 }} />
          <Button label="Salvar perfil" icon="checkmark" onPress={confirm} disabled={!isCompleteProfile(draft)} style={{ flex: 1 }} />
        </View>
      )}

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
      // Rótulo explícito: sem ele, na web o nome do botão incluiria os caracteres dos ícones.
      accessibilityLabel="Calcular para um paciente cadastrado"
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
