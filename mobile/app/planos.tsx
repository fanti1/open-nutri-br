import { MealPlanList } from '../src/features/mealPlans/MealPlanList';
import { Screen } from '../src/ui/Screen';

/** Todos os planos alimentares e recordatórios (de pacientes ou avulsos). */
export default function MealPlansScreen() {
  return (
    <Screen back title="Planos alimentares" subtitle="Planos e recordatórios 24 h com a TACO, sem internet">
      <MealPlanList showPatient />
    </Screen>
  );
}
