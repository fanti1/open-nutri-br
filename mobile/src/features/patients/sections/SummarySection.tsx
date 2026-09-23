import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../../data/DataProvider';
import type { MeasurementField, Patient } from '../../../data/models';
import { useLiveQuery } from '../../../data/useLiveQuery';
import { formatNumber } from '../../../lib/format';
import { useTheme } from '../../../theme/ThemeProvider';
import { AppText } from '../../../ui/AppText';
import { Card } from '../../../ui/Card';
import { Segmented } from '../../../ui/Chips';
import { LineChart } from '../../../ui/LineChart';
import { Section } from '../../../ui/Section';

const CHARTABLE: Array<{ value: MeasurementField; label: string; unit: string }> = [
  { value: 'weight_kg', label: 'Peso', unit: 'kg' },
  { value: 'height_cm', label: 'Estatura', unit: 'cm' },
  { value: 'waist_cm', label: 'Cintura', unit: 'cm' },
];

export function SummarySection({ patient }: { patient: Patient }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { consultations } = useData();
  const [chartField, setChartField] = useState<MeasurementField>('weight_kg');

  const { data: latest } = useLiveQuery(['consultations'], () => consultations.latestMeasurements(patient.id), [patient.id]);
  const { data: series = [] } = useLiveQuery(['consultations'], () => consultations.measurementSeries(patient.id, chartField), [patient.id, chartField]);

  const hasMeasures = latest?.weight_kg !== undefined || latest?.height_cm !== undefined || latest?.waist_cm !== undefined;
  const bmi = latest?.weight_kg && latest?.height_cm ? latest.weight_kg / (latest.height_cm / 100) ** 2 : null;
  const unit = CHARTABLE.find((c) => c.value === chartField)!.unit;

  return (
    <View style={{ gap: 16 }}>
      {!hasMeasures ? (
        <Card tone="alt" onPress={() => router.push(`/atendimento/novo?patientId=${patient.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="scale-outline" size={22} color={colors.primary} />
          <AppText variant="caption" tone="muted" style={{ flex: 1 }}>
            Sem medidas ainda. Registre um atendimento com peso e estatura para ver o IMC e a evolução aqui.
          </AppText>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </Card>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Metric label="Peso" value={latest?.weight_kg} unit="kg" />
          <Metric label="Estatura" value={latest?.height_cm} unit="cm" />
          <Metric label="IMC" value={bmi ?? undefined} unit="kg/m²" />
        </View>
      )}

      {hasMeasures && (
        <Section title="Evolução">
          <Card style={{ gap: 12 }}>
            <Segmented options={CHARTABLE} value={chartField} onChange={setChartField} />
            {series.length ? (
              <>
                <LineChart points={series.map((p) => ({ date: p.occurred_at, value: p.value }))} unit={unit} />
                {series.length === 1 && (
                  <AppText variant="caption" tone="subtle" align="center">
                    A linha de evolução aparece a partir do segundo atendimento com esta medida.
                  </AppText>
                )}
              </>
            ) : (
              <AppText tone="muted" align="center" style={{ paddingVertical: 24 }}>
                Registre medidas nos atendimentos para ver a evolução.
              </AppText>
            )}
          </Card>
        </Section>
      )}

      {patient.notes && (
        <Section title="Observações">
          <Card>
            <AppText>{patient.notes}</AppText>
          </Card>
        </Section>
      )}

      {(patient.phone || patient.email || patient.cpf) && (
        <Section title="Contato">
          <Card style={{ gap: 6 }}>
            {patient.phone && <ContactLine icon="call-outline" text={patient.phone} />}
            {patient.email && <ContactLine icon="mail-outline" text={patient.email} />}
            {patient.cpf && <ContactLine icon="card-outline" text={`CPF ${patient.cpf}`} />}
          </Card>
        </Section>
      )}
    </View>
  );
}

function Metric({ label, value, unit }: { label: string; value: number | undefined; unit: string }) {
  return (
    <Card style={{ flex: 1, gap: 2 }}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="title">{value !== undefined ? formatNumber(Math.round(value * 10) / 10) : '—'}</AppText>
      <AppText variant="small" tone="subtle">
        {unit}
      </AppText>
    </Card>
  );
}

function ContactLine({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <AppText>{text}</AppText>
    </View>
  );
}
