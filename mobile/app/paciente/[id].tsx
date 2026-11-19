import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useData } from '../../src/data/DataProvider';
import { LIFE_STAGE_LABELS } from '../../src/domain/calculators/support/lifeStage';
import { usePatient, useSettings } from '../../src/data/hooks';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { buildPatientReportHtml } from '../../src/features/files/patientReport';
import { MealPlanList } from '../../src/features/mealPlans/MealPlanList';
import { exportPdf } from '../../src/features/files/printService';
import { patientLifeStage, sexLabel } from '../../src/features/patients/patientHelpers';
import { AgendaSection } from '../../src/features/patients/sections/AgendaSection';
import { CalculationsSection } from '../../src/features/patients/sections/CalculationsSection';
import { ConsultationsSection } from '../../src/features/patients/sections/ConsultationsSection';
import { FilesSection } from '../../src/features/patients/sections/FilesSection';
import { SummarySection } from '../../src/features/patients/sections/SummarySection';
import { formatAge, formatDate } from '../../src/lib/format';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Button } from '../../src/ui/Button';
import { Card } from '../../src/ui/Card';
import { confirm } from '../../src/ui/dialogs';
import { EmptyState } from '../../src/ui/EmptyState';
import { IconButton } from '../../src/ui/IconButton';
import { IconTile } from '../../src/ui/IconTile';
import { ListItem } from '../../src/ui/ListItem';
import { Screen } from '../../src/ui/Screen';
import { Sheet } from '../../src/ui/Sheet';
import { TabBar } from '../../src/ui/TabBar';
import { toast } from '../../src/ui/Toast';

type Tab = 'resumo' | 'atendimentos' | 'dieta' | 'calculos' | 'arquivos';

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
  const { data: counts } = useLiveQuery(
    ['consultations', 'calculations', 'attachments', 'meal_plans'],
    async () => (id ? patients.recordCounts(id) : undefined),
    [id],
  );

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
      title={patient.name}
      subtitle={`${LIFE_STAGE_LABELS[patientLifeStage(patient)]} · ${formatAge(patient.birth_date)} · ${sexLabel(patient.sex)} · nasc. ${formatDate(patient.birth_date)}`}
      hero={{ overlap: 36 }}
      right={<IconButton icon="ellipsis-horizontal" label="Mais opções" variant="onHero" onPress={() => setMenuOpen(true)} />}
    >
      <Card style={{ flexDirection: 'row', gap: 8, padding: 10 }}>
        <Button label="Atendimento" icon="add" size="sm" onPress={() => router.push(`/atendimento/novo?patientId=${patient.id}`)} style={{ flex: 1.2 }} />
        <Button label="Calcular" icon="calculator-outline" size="sm" variant="secondary" onPress={() => router.push(`/paciente/calcular/${patient.id}`)} style={{ flex: 1 }} />
        <Button label="Agendar" icon="calendar-outline" size="sm" variant="secondary" onPress={() => router.push(`/compromisso/novo?patientId=${patient.id}`)} style={{ flex: 1 }} />
      </Card>

      <TabBar
        tabs={[
          { value: 'resumo', label: 'Resumo', icon: 'pulse-outline' },
          { value: 'atendimentos', label: 'Atendimentos', icon: 'document-text-outline', count: counts?.consultations },
          { value: 'dieta', label: 'Dieta', icon: 'restaurant-outline', count: counts?.mealPlans },
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
      {tab === 'dieta' && <MealPlanList patientId={patient.id} />}
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
