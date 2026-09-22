import { View } from 'react-native';
import type { AppointmentStatus } from '../../data/models';
import type { AppointmentWithPatient } from '../../data/repositories/appointments';
import { formatTime, relativeDay } from '../../lib/format';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  faltou: 'Faltou',
};

export function useStatusColor(status: AppointmentStatus): string {
  const { colors } = useTheme();
  return { agendado: colors.info, realizado: colors.success, cancelado: colors.textSubtle, faltou: colors.warning }[status];
}

/** Compromisso da agenda: horário em destaque à esquerda, título, paciente e status. */
export function AppointmentRow({ appointment, showDay, onPress }: { appointment: AppointmentWithPatient; showDay?: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const statusColor = useStatusColor(appointment.status);
  const inactive = appointment.status === 'cancelado';

  return (
    <Card onPress={onPress} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', opacity: inactive ? 0.6 : 1 }}>
      <View style={{ alignItems: 'center', minWidth: 54, paddingRight: 12, borderRightWidth: 3, borderRightColor: statusColor }}>
        {showDay && (
          <AppText variant="small" tone="muted">
            {relativeDay(appointment.starts_at)}
          </AppText>
        )}
        <AppText variant="heading">{formatTime(appointment.starts_at)}</AppText>
        <AppText variant="small" tone="subtle">
          {appointment.duration_minutes} min
        </AppText>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="bodyStrong" numberOfLines={1} style={{ textDecorationLine: inactive ? 'line-through' : 'none' }}>
          {appointment.title}
        </AppText>
        {appointment.patient_name && !appointment.title.includes(appointment.patient_name) && (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {appointment.patient_name}
          </AppText>
        )}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Badge label={STATUS_LABELS[appointment.status]} color={statusColor} />
          {appointment.reminder_minutes != null && appointment.status === 'agendado' && <Badge label="Lembrete" color={colors.accent} />}
        </View>
      </View>
    </Card>
  );
}
