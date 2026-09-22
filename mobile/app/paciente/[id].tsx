import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { usePatient, useSettings } from '../../src/data/hooks';
import { LifeStageBadge } from '../../src/features/common/LifeStageBadge';
import { buildPatientReportHtml } from '../../src/features/files/patientReport';
import { exportPdf } from '../../src/features/files/printService';
import { patientLifeStage, sexLabel } from '../../src/features/patients/patientHelpers';
import { AgendaSection } from '../../src/features/patients/sections/AgendaSection';
import { CalculationsSection } from '../../src/features/patients/sections/CalculationsSection';
import { ConsultationsSection } from '../../src/features/patients/sections/ConsultationsSection';
import { FilesSection } from '../../src/features/patients/sections/FilesSection';
import { SummarySection } from '../../src/features/patients/sections/SummarySection';
import { formatAge, formatDate } from '../../src/lib/format';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Avatar } from '../../src/ui/Avatar';
import { Card } from '../../src/ui/Card';
import { ChipGroup } from '../../src/ui/Chips';
import { confirm } from '../../src/ui/dialogs';
import { EmptyState } from '../../src/ui/EmptyState';
import { IconTile, type IconName } from '../../src/ui/IconTile';
import { ListItem } from '../../src/ui/ListItem';
import { Screen } from '../../src/ui/Screen';
import { Sheet } from '../../src/ui/Sheet';
import { toast } from '../../src/ui/Toast';

type Tab = 'resumo' | 'atendimentos' | 'calculos' | 'arquivos' | 'agenda';

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'resumo', label: 'Resumo' },
  { value: 'atendimentos', label: 'Atendimentos' },
  { value: 'calculos', label: 'Cálculos' },
  { value: 'arquivos', label: 'Arquivos' },
  { value: 'agenda', label: 'Agenda' },
];

/** Ficha do paciente: tudo sobre ele em um só lugar. */
export default function PatientRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { patients, consultations, calculations } = useData();
  const { data: patient, loading } = usePatient(id);
  const { data: settings } = useSettings();
  const [tab, setTab] = useState<Tab>('resumo');
  const [menuOpen, setMenuOpen] = useState(false);

  if (!patient) {
    return (
      <Screen back title="Ficha">
        {!loading && <EmptyState icon="person-outline" title="Paciente não encontrado" />}
      </Screen>
    );
  }

  const exportRecord = async () => {
    setMenuOpen(false);
    const [patientConsultations, patientCalculations] = await Promise.all([
      consultations.listByPatient(patient.id),
      calculations.listByPatient(patient.id),
    ]);
    await exportPdf(
      buildPatientReportHtml({
        patient,
        consultations: patientConsultations,
        calculations: patientCalculations,
        profile: settings!.profile,
      }),
    );
  };

  const remove = async () => {
    setMenuOpen(false);
    const ok = await confirm(
      'Excluir paciente',
      `A ficha de ${patient.name} será apagada com todos os atendimentos, cálculos e arquivos. Esta ação não pode ser desfeita.`,
      'Excluir',
      true,
    );
    if (!ok) return;
    await patients.remove(patient.id);
    toast.success('Ficha excluída');
    router.back();
  };

  return (
    <Screen
      back
      title="Ficha"
      right={
        <Pressable accessibilityLabel="Mais opções" onPress={() => setMenuOpen(true)} hitSlop={12}>
          <Ionicons name="ellipsis-horizontal-circle" size={28} color={colors.text} />
        </Pressable>
      }
    >
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Avatar name={patient.name} size={60} />
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="title">{patient.name}</AppText>
            <AppText tone="muted">
              {formatAge(patient.birth_date)} · {sexLabel(patient.sex)}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <LifeStageBadge stage={patientLifeStage(patient)} />
              <AppText variant="small" tone="subtle">
                nasc. {formatDate(patient.birth_date)}
              </AppText>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Action icon="document-text-outline" label="Atendimento" onPress={() => router.push(`/atendimento/novo?patientId=${patient.id}`)} />
          <Action icon="calculator-outline" label="Calcular" onPress={() => router.push(`/paciente/calcular/${patient.id}`)} />
          <Action icon="calendar-outline" label="Agendar" onPress={() => router.push(`/compromisso/novo?patientId=${patient.id}`)} />
          <Action icon="share-outline" label="PDF" onPress={exportRecord} />
        </View>
      </Card>

      <ChipGroup scroll options={TABS} value={tab} onChange={setTab} />

      {tab === 'resumo' && <SummarySection patient={patient} />}
      {tab === 'atendimentos' && <ConsultationsSection patient={patient} />}
      {tab === 'calculos' && <CalculationsSection patient={patient} />}
      {tab === 'arquivos' && <FilesSection patient={patient} />}
      {tab === 'agenda' && <AgendaSection patient={patient} />}

      <Sheet visible={menuOpen} onClose={() => setMenuOpen(false)} title={patient.name}>
        <ListItem title="Editar dados" left={<IconTile name="create-outline" size={36} />} onPress={() => { setMenuOpen(false); router.push(`/paciente/editar/${patient.id}`); }} divider />
        <ListItem title="Exportar ficha em PDF" left={<IconTile name="document-attach-outline" size={36} />} onPress={exportRecord} divider />
        <ListItem title="Excluir paciente" danger left={<IconTile name="trash-outline" size={36} color={colors.danger} />} onPress={remove} />
      </Sheet>
    </Screen>
  );
}

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ alignItems: 'center', gap: 6, flex: 1, opacity: pressed ? 0.7 : 1 })}>
      <IconTile name={icon} size={44} />
      <AppText variant="small" tone="muted">
        {label}
      </AppText>
    </Pressable>
  );
}
