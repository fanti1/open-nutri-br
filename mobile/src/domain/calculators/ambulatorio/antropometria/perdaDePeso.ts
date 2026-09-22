import { makeCalculator } from '../../support/makeCalculator';
import { round2 } from '../../support/round';

export interface PerdaDePesoInputs {
  usual_weight_kg: number;
  current_weight_kg: number;
  period_days: number;
}

interface Threshold {
  maxDays: number;
  significant: number;
  severe: number;
}

/**
 * Significance thresholds by time window, per Blackburn GL et al., JPEN, 1977.
 * The 1-week row is the only one with a distinct significant/severe range —
 * the others use a single published cutoff for both.
 */
const THRESHOLDS: Threshold[] = [
  { maxDays: 7, significant: 1.0, severe: 2.0 },
  { maxDays: 30, significant: 5.0, severe: 5.0 },
  { maxDays: 90, significant: 7.5, severe: 7.5 },
  { maxDays: 180, significant: 10.0, severe: 10.0 },
];

export function perdaDePesoFormula(inputs: PerdaDePesoInputs): Record<string, number> {
  const percentage =
    ((inputs.usual_weight_kg - inputs.current_weight_kg) / inputs.usual_weight_kg) * 100;

  return { percentage: round2(percentage) };
}

export function perdaDePesoClassifier(
  result: Record<string, number>,
  inputs: PerdaDePesoInputs,
): string {
  const bucket =
    THRESHOLDS.find((row) => inputs.period_days <= row.maxDays) ?? THRESHOLDS[THRESHOLDS.length - 1];

  if (result.percentage < bucket.significant) return 'sem_perda_significativa';
  if (result.percentage < bucket.severe) return 'perda_significativa';

  return 'perda_severa';
}

export const perdaDePesoCalculator = makeCalculator<PerdaDePesoInputs>({
  slug: 'perda-de-peso',
  module: 'ambulatorio',
  category: 'antropometria',
  version: 'v1',
  reference: {
    method: '% de Perda de Peso',
    citation: 'Blackburn GL et al., Nutritional and metabolic assessment of the hospitalized patient, JPEN, 1977.',
  },
  lifeStages: ['adulto', 'idoso'],
  formula: perdaDePesoFormula,
  classifier: perdaDePesoClassifier,
});
