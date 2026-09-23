import type { MealPlan, MealPlanItem } from '../../../data/models';
import { buildMealPlanHtml } from '../mealPlanReport';
import { itemsByMeal, parseKcal, planTotals } from '../planTotals';

const plan: MealPlan = {
  id: 'p1',
  patient_id: 'x',
  kind: 'plano',
  title: 'Plano',
  target_kcal: 1800,
  reference_date: '2026-09-23',
  notes: 'Beber 2 L de água <por dia>',
  created_at: '',
  updated_at: '',
};

const item = (id: string, meal: string, quantity_g: number, household_measure: string | null = null): MealPlanItem => ({
  id,
  plan_id: 'p1',
  meal,
  food_id: 1, // Arroz, integral, cozido — 124 kcal/100 g
  food_name: 'Arroz, integral, cozido',
  quantity_g,
  household_measure,
  position: 0,
  created_at: '',
});

const items = [item('a', 'almoco', 150, '4 colheres de sopa'), item('b', 'cafe_da_manha', 50)];

describe('meal plan totals and PDF', () => {
  it('groups items by meal in the order of the day, with kcal per meal', () => {
    const meals = itemsByMeal(items);
    expect(meals.map((m) => m.key)).toEqual(['cafe_da_manha', 'lanche_da_manha', 'almoco', 'lanche_da_tarde', 'jantar', 'ceia']);
    expect(meals[2].kcal).toBeCloseTo(186, 5);
    expect(planTotals(items).values.energy_kcal).toBeCloseTo(248, 5);
  });

  it('prints meals, household measures, totals and escaped notes', () => {
    const html = buildMealPlanHtml({
      plan,
      items,
      patientName: 'Maria',
      profile: { name: 'Ana', crn_number: '123', crn_state: 'SP', specialty: '' },
      generatedAt: new Date('2026-09-23T12:00:00'),
    });
    expect(html).toContain('Plano alimentar');
    expect(html).toContain('4 colheres de sopa');
    expect(html).toContain('248 kcal');
    expect(html).toContain('meta 1.800 kcal');
    expect(html).toContain('CRN SP 123');
    expect(html).toContain('&lt;por dia&gt;');
    expect(html).not.toContain('Lanche da tarde');
  });
});

describe('parseKcal (meta de energia digitada)', () => {
  it.each([
    ['1800', 1800],
    ['1.800', 1800],
    ['2.150,5', 2150.5],
    ['1850,5', 1850.5],
    [' 2000 ', 2000],
    ['6500', 6500],
  ])('%s → %d', (text, expected) => expect(parseKcal(text)).toBe(expected));

  it.each(['', '   ', '0', '-100', 'abc', '10001'])('"%s" → sem meta', (text) => expect(parseKcal(text)).toBeNull());
});
