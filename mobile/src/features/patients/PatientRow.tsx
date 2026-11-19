import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import type { Patient } from '../../data/models';
import { formatAge } from '../../lib/format';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Avatar } from '../../ui/Avatar';
import { LifeStageBadge } from '../common/LifeStageBadge';
import { patientLifeStage, sexLabel } from './patientHelpers';

interface PatientRowProps {
  patient: Pick<Patient, 'id' | 'name' | 'birth_date' | 'sex'>;
  /** Recebe o id: a mesma função serve para todas as linhas e a lista não redesenha à toa. */
  onPress: (id: string) => void;
  /** Linha fina acima (a partir do 2º item da lista). */
  divider?: boolean;
  /** Etiqueta Criança/Adulto/Idoso à direita. */
  showStage?: boolean;
}

/** Paciente numa lista agrupada dentro de um cartão (Início e aba Pacientes). */
export const PatientRow = memo(function PatientRow({ patient, onPress, divider, showStage }: PatientRowProps) {
  const { colors } = useTheme();
  const details = `${formatAge(patient.birth_date)} · ${sexLabel(patient.sex)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${patient.name}, ${details}`}
      onPress={() => onPress(patient.id)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 64,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: colors.border,
        backgroundColor: pressed ? colors.surfacePressed : 'transparent',
      })}
    >
      <Avatar name={patient.name} size={40} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {patient.name}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {details}
        </AppText>
      </View>
      {showStage && <LifeStageBadge stage={patientLifeStage(patient)} />}
      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
    </Pressable>
  );
});
