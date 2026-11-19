import { chartSummary } from '../chartSummary';

describe('resumo falado do gráfico de evolução', () => {
  it('período, primeira e última, variação, mínima e máxima', () => {
    const points = [
      { date: '2026-01-10', value: 82.4 },
      { date: '2026-02-10', value: 79.95 },
      { date: '2026-03-10', value: 80.1 },
    ];
    expect(chartSummary('Peso', points, 'kg')).toBe(
      'Peso: 3 medidas, de 10/01/2026 a 10/03/2026. Primeira 82,4 kg, última 80,1 kg, queda de 2,3 kg. Mínima 80 kg, máxima 82,4 kg.',
    );
  });

  it('aumento, sem variação, uma medida e nenhuma', () => {
    expect(chartSummary('Cintura', [{ date: '2026-01-10', value: 80 }, { date: '2026-02-10', value: 82 }], 'cm')).toContain('aumento de 2 cm');
    expect(chartSummary('Estatura', [{ date: '2026-01-10', value: 160 }, { date: '2026-02-10', value: 160 }], 'cm')).toContain('sem variação');
    expect(chartSummary('Peso', [{ date: '2026-01-10', value: 70 }], 'kg')).toBe('Peso: uma medida, 70 kg em 10/01/2026.');
    expect(chartSummary('Peso', [], 'kg')).toBe('Peso: sem medidas.');
  });
});
