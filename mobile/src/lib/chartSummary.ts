import { formatDate, formatNumber } from './format';

export interface SeriesPoint {
  date: string;
  value: number;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * O que um gráfico de evolução mostra, em uma frase para o leitor de tela:
 * período, primeira e última medida, variação, mínimo e máximo.
 */
export function chartSummary(label: string, points: SeriesPoint[], unit: string): string {
  if (!points.length) return `${label}: sem medidas.`;
  const show = (value: number) => `${formatNumber(round1(value))} ${unit}`;
  const first = points[0];
  const last = points[points.length - 1];

  if (points.length === 1) return `${label}: uma medida, ${show(first.value)} em ${formatDate(first.date)}.`;

  const change = round1(last.value - first.value);
  const trend = change === 0 ? 'sem variação' : `${change > 0 ? 'aumento' : 'queda'} de ${show(Math.abs(change))}`;
  const values = points.map((point) => point.value);

  return (
    `${label}: ${points.length} medidas, de ${formatDate(first.date)} a ${formatDate(last.date)}. ` +
    `Primeira ${show(first.value)}, última ${show(last.value)}, ${trend}. ` +
    `Mínima ${show(Math.min(...values))}, máxima ${show(Math.max(...values))}.`
  );
}
