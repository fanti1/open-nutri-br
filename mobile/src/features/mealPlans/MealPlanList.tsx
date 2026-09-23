import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useData } from '../../data/DataProvider';
import type { MealPlanKind } from '../../data/models';
import type { MealPlanWithPatient } from '../../data/repositories/mealPlans';
import { useLiveQuery } from '../../data/useLiveQuery';
import { formatDate, formatNumber, toDateOnly } from '../../lib/format';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { planTotals } from './planTotals';

/** Cria um plano/recordatório e abre o editor. */
export function useCreateMealPlan() {
  const router = useRouter();
  const { mealPlans } = useData();
  return async (kind: MealPlanKind, patientId: string | null) => {
    const today = toDateOnly(new Date());
    const id = await mealPlans.create({
      patient_id: patientId,
      kind,
      title: kind === 'plano' ? 'Plano alimentar' : 'Recordatório 24 h',
      reference_date: today,
    });
    router.push(`/plano/${id}`);
  };
}

/** Planos alimentares e recordatórios (de um paciente ou de todos), com o total de energia de cada um. */
export function MealPlanList({ patientId, showPatient }: { patientId?: string; showPatient?: boolean }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { mealPlans } = useData();
  const create = useCreateMealPlan();

  const { data: plans = [] } = useLiveQuery(
    ['meal_plans', 'meal_plan_items', 'patients'],
    async () => {
      const list = await mealPlans.list(patientId);
      return Promise.all(list.map(async (plan) => ({ plan, kcal: planTotals(await mealPlans.items(plan.id)).values.energy_kcal })));
    },
    [patientId],
  );

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button label="Plano alimentar" icon="restaurant-outline" size="sm" onPress={() => create('plano', patientId ?? null)} style={{ flex: 1 }} />
        <Button label="Recordatório 24 h" icon="time-outline" size="sm" variant="secondary" onPress={() => create('recordatorio', patientId ?? null)} style={{ flex: 1 }} />
      </View>

      {plans.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title="Nenhum plano ainda"
          message="Monte o plano alimentar com os alimentos da TACO, ou registre o recordatório 24 h do que o paciente comeu."
        />
      ) : (
        <Card padded={false} style={{ overflow: 'hidden' }}>
          {plans.map(({ plan, kcal }, index) => (
            <PlanRow key={plan.id} plan={plan} kcal={kcal} showPatient={showPatient} divider={index < plans.length - 1} onPress={() => router.push(`/plano/${plan.id}`)} colors={colors} />
          ))}
        </Card>
      )}
    </View>
  );
}

function PlanRow({
  plan,
  kcal,
  showPatient,
  divider,
  onPress,
  colors,
}: {
  plan: MealPlanWithPatient;
  kcal: number;
  showPatient?: boolean;
  divider: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const isPlan = plan.kind === 'plano';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={plan.title}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={isPlan ? 'restaurant-outline' : 'time-outline'} size={22} color={isPlan ? colors.primary : colors.accent} />
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {plan.title}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {[showPatient && plan.patient_name, plan.reference_date && formatDate(plan.reference_date), `${plan.item_count} ${plan.item_count === 1 ? 'alimento' : 'alimentos'}`]
            .filter(Boolean)
            .join(' · ')}
        </AppText>
        <Badge label={isPlan ? 'Plano alimentar' : 'Recordatório 24 h'} color={isPlan ? colors.primary : colors.accent} />
      </View>
      <AppText variant="bodyStrong" tone="primary">
        {formatNumber(Math.round(kcal))} kcal
      </AppText>
    </Pressable>
  );
}
