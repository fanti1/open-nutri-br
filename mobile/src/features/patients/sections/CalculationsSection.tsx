import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useData } from '../../../data/DataProvider';
import type { Patient } from '../../../data/models';
import { useLiveQuery } from '../../../data/useLiveQuery';
import { classificationTone } from '../../../domain/catalog';
import { classificationLabel, fieldLabel } from '../../../domain/forms/fieldLabels';
import { formatDate, formatNumber } from '../../../lib/format';
import { useTheme } from '../../../theme/ThemeProvider';
import { AppText } from '../../../ui/AppText';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { confirm } from '../../../ui/dialogs';
import { EmptyState } from '../../../ui/EmptyState';

export function CalculationsSection({ patient }: { patient: Patient }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { calculations } = useData();
  const { data = [], loading } = useLiveQuery(['calculations'], () => calculations.listByPatient(patient.id), [patient.id]);

  const toneColor = { success: colors.success, warning: colors.warning, danger: colors.danger, info: colors.info };
  const calculate = () => router.push(`/paciente/calcular/${patient.id}`);

  const remove = async (id: string, name: string) => {
    if (await confirm('Excluir cálculo', `Remover “${name}” da ficha?`, 'Excluir', true)) await calculations.remove(id);
  };

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        icon="calculator-outline"
        title="Nenhum cálculo salvo"
        message="Calcule a partir da ficha: idade, sexo e medidas já vêm preenchidos."
        actionLabel="Calcular"
        onAction={calculate}
      />
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <Button label="Calcular" icon="calculator" variant="secondary" onPress={calculate} />
      {data.map((calc) => {
        const [mainKey, mainValue] = Object.entries(calc.values)[0] ?? [];
        return (
          <Card key={calc.id} onPress={() => router.push(`/calculadora/${calc.calculator_slug}?patientId=${patient.id}`)} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppText variant="bodyStrong" style={{ flex: 1 }}>
                {calc.calculator_name}
              </AppText>
              <AppText variant="small" tone="subtle">
                {formatDate(calc.created_at)}
              </AppText>
              <Pressable accessibilityLabel="Excluir cálculo" onPress={() => remove(calc.id, calc.calculator_name)} hitSlop={10}>
                <Ionicons name="trash-outline" size={18} color={colors.textSubtle} />
              </Pressable>
            </View>
            {mainKey && (
              <AppText>
                {fieldLabel(mainKey)}: <AppText variant="bodyStrong">{formatNumber(mainValue)}</AppText>
              </AppText>
            )}
            {calc.classification && <Badge label={classificationLabel(calc.classification)} color={toneColor[classificationTone(calc.classification)]} />}
          </Card>
        );
      })}
    </View>
  );
}
