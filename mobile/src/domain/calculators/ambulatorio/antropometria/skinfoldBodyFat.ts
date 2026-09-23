import { round2, round4 } from '../../support/round';

/**
 * Formato comum das equações de dobras cutâneas: densidade corporal → % de
 * gordura pela equação de Siri (1961), %G = (4,95 / D − 4,50) × 100.
 */
export function skinfoldBodyFat(density: number, sumSkinfolds: number): Record<string, number> {
  return {
    body_fat_percent: round2((4.95 / density - 4.5) * 100),
    body_density: round4(density),
    sum_skinfolds_mm: round2(sumSkinfolds),
  };
}
