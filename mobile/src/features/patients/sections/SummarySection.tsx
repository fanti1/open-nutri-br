import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useData } from '../../../data/DataProvider';
import type { MeasurementField, Patient } from '../../../data/models';
import { useLiveQuery } from '../../../data/useLiveQuery';
import { formatDate, formatNumber } from '../../../lib/format';
import { useTheme } from '../../../theme/ThemeProvider';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Callout } from '../../../ui/Callout';
import { Card } from '../../../ui/Card';
import { Segmented } from '../../../ui/Chips';
import { LineChart } from '../../../ui/LineChart';
import { Section } from '../../../ui/Section';

const CHARTABLE: { value: MeasurementField; label: string; unit: string }[] = [
  { value: 'weight_kg', label: 'Peso', unit: 'kg' },
  { value: 'height_cm', label: 'Estatura', unit: 'cm' },
  { value: 'waist_cm', label: 'Cintura', unit: 'cm' },
];

export function SummarySection({ patient }: { patient: Patient }) {
  const router = useRouter();
  const { consultations } = useData();
  const [chartField, setChartField] = useState<MeasurementField>('weight_kg');
  const [asTable, setAsTable] = useState(false);

  const { data: latest } = useLiveQuery(['consultations'], () => consultations.latestMeasurements(patient.id), [patient.id]);
  const { data: series = [] } = useLiveQuery(['consultations'], () => consultations.measurementSeries(patient.id, chartField), [patient.id, chartField]);

  const hasMeasures = latest?.weight_kg !== undefined || latest?.height_cm !== undefined || latest?.waist_cm !== undefined;
  const bmi = latest?.weight_kg && latest?.height_cm ? latest.weight_kg / (latest.height_cm / 100) ** 2 : null;
  const { unit, label } = CHARTABLE.find((c) => c.value === chartField)!;
  const points = series.map((p) => ({ date: p.occurred_at, value: p.value }));

  return (
    <View style={{ gap: 16 }}>
      {!hasMeasures ? (
        <Callout tone="info" icon="scale-outline" title="Sem medidas ainda" onPress={() => router.push(`/atendimento/novo?patientId=${patient.id}`)}>
          Registre um atendimento com peso e estatura para ver o IMC e a evolução aqui.
        </Callout>
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
                {asTable ? <SeriesTable points={points} unit={unit} label={label} /> : <LineChart points={points} unit={unit} label={label} />}
                {series.length === 1 && !asTable && (
                  <AppText variant="caption" tone="subtle" align="center">
                    A linha de evolução aparece a partir do segundo atendimento com esta medida.
                  </AppText>
                )}
                <Button
                  label={asTable ? 'Ver como gráfico' : 'Ver como tabela'}
                  icon={asTable ? 'analytics-outline' : 'list-outline'}
                  variant="ghost"
                  size="sm"
                  onPress={() => setAsTable((value) => !value)}
                  style={{ alignSelf: 'center' }}
                />
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

/** As mesmas medidas do gráfico, uma por linha (mais recente primeiro). */
function SeriesTable({ points, unit, label }: { points: { date: string; value: number }[]; unit: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View accessibilityLabel={`Tabela de ${label.toLowerCase()} por atendimento`}>
      <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <AppText variant="label" tone="muted" style={{ flex: 1 }}>
          Data
        </AppText>
        <AppText variant="label" tone="muted">
          {label} ({unit})
        </AppText>
      </View>
      {[...points].reverse().map((point, index) => (
        <View
          key={`${point.date}-${index}`}
          accessible
          accessibilityLabel={`${formatDate(point.date)}: ${formatNumber(point.value)} ${unit}`}
          style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: index < points.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: colors.border }}
        >
          <AppText style={{ flex: 1 }}>{formatDate(point.date)}</AppText>
          <AppText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>
            {formatNumber(point.value)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function Metric({ label, value, unit }: { label: string; value: number | undefined; unit: string }) {
  return (
    <Card style={{ flex: 1, gap: 2 }}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="title" style={{ fontVariant: ['tabular-nums'] }}>
        {value !== undefined ? formatNumber(Math.round(value * 10) / 10) : '—'}
      </AppText>
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
