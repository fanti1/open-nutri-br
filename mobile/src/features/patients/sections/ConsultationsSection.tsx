import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useData } from '../../../data/DataProvider';
import type { Consultation, Patient } from '../../../data/models';
import { useLiveQuery } from '../../../data/useLiveQuery';
import { formatDateTime, formatNumber } from '../../../lib/format';
import { useTheme } from '../../../theme/ThemeProvider';
import { AppText } from '../../../ui/AppText';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { EmptyState } from '../../../ui/EmptyState';

export const KIND_LABELS = { consulta: 'Consulta', retorno: 'Retorno', avaliacao: 'Avaliação' } as const;

export function measuresSummary(c: Consultation): string {
  return [
    c.weight_kg != null && `${formatNumber(c.weight_kg)} kg`,
    c.height_cm != null && `${formatNumber(c.height_cm)} cm`,
    c.waist_cm != null && `cintura ${formatNumber(c.waist_cm)} cm`,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function ConsultationsSection({ patient }: { patient: Patient }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { consultations } = useData();
  const { data = [], loading } = useLiveQuery(['consultations'], () => consultations.listByPatient(patient.id), [patient.id]);

  const create = () => router.push(`/atendimento/novo?patientId=${patient.id}`);

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        icon="document-text-outline"
        title="Nenhum atendimento"
        message="Registre a consulta com medidas, evolução e conduta."
        actionLabel="Novo atendimento"
        onAction={create}
      />
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <Button label="Novo atendimento" icon="add" variant="secondary" onPress={create} />
      {data.map((consultation) => (
        <Card
          key={consultation.id}
          onPress={() => router.push(`/atendimento/${consultation.id}`)}
          accessibilityLabel={[`${KIND_LABELS[consultation.kind]} em ${formatDateTime(consultation.occurred_at)}`, measuresSummary(consultation), consultation.complaint || consultation.notes]
            .filter(Boolean)
            .join('. ')}
          style={{ gap: 6 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="bodyStrong">{formatDateTime(consultation.occurred_at)}</AppText>
            <Badge label={KIND_LABELS[consultation.kind]} color={colors.primary} />
          </View>
          {measuresSummary(consultation) !== '' && (
            <AppText variant="caption" tone="muted">
              {measuresSummary(consultation)}
            </AppText>
          )}
          {(consultation.complaint || consultation.notes) && (
            <AppText numberOfLines={2}>{consultation.complaint || consultation.notes}</AppText>
          )}
        </Card>
      ))}
    </View>
  );
}
