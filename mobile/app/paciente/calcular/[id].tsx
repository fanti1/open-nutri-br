import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePatient } from '../../../src/data/hooks';
import { LIFE_STAGE_LABELS } from '../../../src/domain/calculators/support/lifeStage';
import { CalculatorBrowser } from '../../../src/features/calculators/CalculatorBrowser';
import { patientLifeStage } from '../../../src/features/patients/patientHelpers';
import { Screen } from '../../../src/ui/Screen';

/** Escolha de calculadora a partir da ficha: só aparece o que é validado para a faixa etária do paciente. */
export default function PatientCalculatorPickerScreen() {
  const { id, consultationId } = useLocalSearchParams<{ id: string; consultationId?: string }>();
  const router = useRouter();
  const { data: patient } = usePatient(id);

  if (!patient) return <Screen back title="Calcular" />;

  const stage = patientLifeStage(patient);

  return (
    <Screen back title={`Calcular para ${patient.name.split(' ')[0]}`} subtitle={`Métodos validados para ${LIFE_STAGE_LABELS[stage].toLowerCase()}`}>
      <CalculatorBrowser
        fixedLifeStage={stage}
        onOpen={(entry) =>
          router.push(`/calculadora/${entry.slug}?patientId=${patient.id}${consultationId ? `&consultationId=${consultationId}` : ''}`)
        }
      />
    </Screen>
  );
}
