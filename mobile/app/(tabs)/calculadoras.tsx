import { useRouter } from 'expo-router';
import { CATALOG } from '../../src/domain/catalog';
import { CalculatorBrowser } from '../../src/features/calculators/CalculatorBrowser';
import { Screen } from '../../src/ui/Screen';

export default function CalculatorsScreen() {
  const router = useRouter();

  return (
    <Screen title="Calculadoras" subtitle={`${CATALOG.length} métodos científicos, com referência e faixa etária validada`}>
      <CalculatorBrowser onOpen={(entry) => router.push(`/calculadora/${entry.slug}`)} />
    </Screen>
  );
}
