import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { usePatient, useSettings } from '../../src/data/hooks';
import { useLiveQuery } from '../../src/data/useLiveQuery';
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
import { Button } from '../../src/ui/Button';
import { confirm } from '../../src/ui/dialogs';
import { EmptyState } from '../../src/ui/EmptyState';
import { IconTile } from '../../src/ui/IconTile';
import { ListItem } from '../../src/ui/ListItem';
import { Screen } from '../../src/ui/Screen';
import { Sheet } from '../../src/ui/Sheet';
import { TabBar } from '../../src/ui/TabBar';
import { toast } from '../../src/ui/Toast';

type Tab = 'resumo' | 'atendimentos' | 'calculos' | 'arquivos';

/** Ficha do paciente: tudo sobre ele em um só lugar. */
export default function PatientRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { patients, consultations, calculations, attachments } = useData();
  const { data: patient, loading } = usePatient(id);
  const { data: settings } = useSettings();
  const [tab, setTab] = useState<Tab>('resumo');
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: counts } = useLiveQuery(['consultations', 'calculations', 'attachments'], async () => {
    if (!id) return undefined;
    const [c, k, a] = await Promise.all([consultations.listByPatient(id), calculations.listByPatient(id), attachments.listByPatient(id)]);
    return { consultations: c.length, calculations: k.length, attachments: a.length };
  }, [id]);

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
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <Avatar name={patient.name} size={56} />
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="title" numberOfLines={2}>
            {patient.name}
          </AppText>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <LifeStageBadge stage={patientLifeStage(patient)} />
            <AppText variant="caption" tone="muted">
              {formatAge(patient.birth_date)} · {sexLabel(patient.sex)} · nasc. {formatDate(patient.birth_date)}
            </AppText>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Atendimento" icon="add" size="sm" onPress={() => router.push(`/atendimento/novo?patientId=${patient.id}`)} style={{ flex: 1.2 }} />
        <Button label="Calcular" icon="calculator-outline" size="sm" variant="secondary" onPress={() => router.push(`/paciente/calcular/${patient.id}`)} style={{ flex: 1 }} />
        <Button label="Agendar" icon="calendar-outline" size="sm" variant="secondary" onPress={() => router.push(`/compromisso/novo?patientId=${patient.id}`)} style={{ flex: 1 }} />
      </View>

      <TabBar
        tabs={[
          { value: 'resumo', label: 'Resumo', icon: 'pulse-outline' },
          { value: 'atendimentos', label: 'Atendimentos', icon: 'document-text-outline', count: counts?.consultations },
          { value: 'calculos', label: 'Cálculos', icon: 'calculator-outline', count: counts?.calculations },
          { value: 'arquivos', label: 'Arquivos', icon: 'attach-outline', count: counts?.attachments },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'resumo' && (
        <>
          <SummarySection patient={patient} />
          <AgendaSection patient={patient} />
        </>
      )}
      {tab === 'atendimentos' && <ConsultationsSection patient={patient} />}
      {tab === 'calculos' && <CalculationsSection patient={patient} />}
      {tab === 'arquivos' && <FilesSection patient={patient} />}

      <Sheet visible={menuOpen} onClose={() => setMenuOpen(false)} title={patient.name}>
        <ListItem title="Editar dados" left={<IconTile name="create-outline" size={36} />} onPress={() => { setMenuOpen(false); router.push(`/paciente/editar/${patient.id}`); }} divider />
        <ListItem title="Exportar ficha em PDF" left={<IconTile name="document-attach-outline" size={36} />} onPress={exportRecord} divider />
        <ListItem title="Excluir paciente" danger left={<IconTile name="trash-outline" size={36} color={colors.danger} />} onPress={remove} />
      </Sheet>
    </Screen>
  );
}
