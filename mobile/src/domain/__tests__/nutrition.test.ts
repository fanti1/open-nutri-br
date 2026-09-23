import { searchTaco, tacoFood } from '../foods';
import { macroDistribution, mealLabel, nutrientAmount, proteinPerKg, sumNutrients } from '../nutrition';

const food = (name: string) => searchTaco(name).find((item) => item.name === name)!;

describe('nutrient totals from the TACO table', () => {
  it('scales per-100 g values to the portion', () => {
    const rice = food('Arroz, integral, cozido'); // 124 kcal / 100 g
    const totals = sumNutrients([{ food: rice, grams: 150 }]);
    expect(totals.values.energy_kcal).toBeCloseTo(186, 5);
    expect(totals.values.protein_g).toBeCloseTo(3.9, 5);
  });

  it('adds several foods (a classic rice-and-beans lunch)', () => {
    const totals = sumNutrients([
      { food: food('Arroz, integral, cozido'), grams: 100 }, // 124 kcal, fibra 2,7
      { food: food('Feijão, carioca, cozido'), grams: 100 }, // 76 kcal, fibra 8,5
    ]);
    expect(totals.values.energy_kcal).toBeCloseTo(200, 5);
    expect(totals.values.fiber_g).toBeCloseTo(11.2, 5);
    // Macros completos; vitaminas A e C do arroz não foram analisadas pela TACO (vazias) → total incompleto.
    expect(['energy_kcal', 'protein_g', 'carbohydrate_g', 'lipid_g', 'fiber_g'].some((k) => totals.incomplete.has(k as never))).toBe(false);
    expect(totals.incomplete.has('vitamin_c_mg')).toBe(true);
  });

  it('counts trace (Tr) and not-applicable (NA) as zero, but flags values under review (*) as incomplete', () => {
    expect(nutrientAmount('Tr', 100)).toBe(0);
    expect(nutrientAmount('NA', 100)).toBe(0);
    expect(nutrientAmount('*', 100)).toBeNull();
    expect(nutrientAmount(null, 100)).toBeNull();

    const milk = food('Leite, de vaca, integral'); // energia "*" na TACO
    const totals = sumNutrients([{ food: milk, grams: 200 }]);
    expect(totals.incomplete.has('energy_kcal')).toBe(true);
    expect(totals.values.calcium_mg).toBeCloseTo(246, 5); // 123 mg/100 g
  });

  it('flags every nutrient as incomplete when the food is missing from the table', () => {
    expect(sumNutrients([{ food: tacoFood(99999), grams: 100 }]).incomplete.has('protein_g')).toBe(true);
  });
});

describe('energy distribution', () => {
  it('uses Atwater factors and sums to 100%', () => {
    const split = macroDistribution({ protein_g: 75, carbohydrate_g: 250, lipid_g: 60 }); // 300 + 1000 + 540 kcal
    expect(split.protein).toBeCloseTo(16.3, 1);
    expect(split.carbohydrate).toBeCloseTo(54.3, 1);
    expect(split.lipid).toBeCloseTo(29.3, 1);
    expect(split.protein + split.carbohydrate + split.lipid).toBeCloseTo(100, 5);
    expect(macroDistribution({ protein_g: 0, carbohydrate_g: 0, lipid_g: 0 })).toEqual({ protein: 0, carbohydrate: 0, lipid: 0 });
  });

  it('computes protein per kg and names the meals', () => {
    expect(proteinPerKg(84, 70)).toBeCloseTo(1.2, 5);
    expect(proteinPerKg(84, undefined)).toBeNull();
    expect(mealLabel('lanche_da_tarde')).toBe('Lanche da tarde');
  });
});
