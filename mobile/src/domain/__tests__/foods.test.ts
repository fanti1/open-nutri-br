import { formatTacoValue, searchTaco, tacoFood, tacoGroups } from '../foods';

describe('TACO table (offline)', () => {
  it('ships the full official table: 597 foods in 15 groups', () => {
    const groups = tacoGroups();
    expect(groups).toHaveLength(15);
    expect(groups.reduce((sum, group) => sum + group.count, 0)).toBe(597);
  });

  it('matches the published values (rounded like the printed table)', () => {
    const rice = searchTaco('arroz integral cozido')[0];
    expect(rice.name).toBe('Arroz, integral, cozido');
    expect(rice.energy_kcal).toBe(124);
    expect(rice.protein_g).toBe(2.6);
    expect(rice.carbohydrate_g).toBe(25.8);
    expect(rice.fiber_g).toBe(2.7);

    const beans = searchTaco('feijao carioca cozido')[0];
    expect([beans.energy_kcal, beans.protein_g, beans.fiber_g]).toEqual([76, 4.8, 8.5]);
  });

  it('keeps the official legend markers', () => {
    const milk = searchTaco('leite de vaca integral').find((food) => food.name === 'Leite, de vaca, integral')!;
    expect(milk.energy_kcal).toBe('*');
    expect(formatTacoValue(milk.energy_kcal)).toBe('em reavaliação');
    expect(formatTacoValue('Tr')).toBe('Tr');
    expect(formatTacoValue(null)).toBe('—');
    expect(formatTacoValue(25.8)).toBe('25,8');
  });

  it('searches without accents, requires every word and filters by group', () => {
    expect(searchTaco('pao frances').some((food) => food.name === 'Pão, trigo, francês')).toBe(true);
    expect(searchTaco('', 'Nozes e sementes').every((food) => food.group === 'Nozes e sementes')).toBe(true);
    expect(tacoFood(1)?.name).toBe('Arroz, integral, cozido');
  });
});
