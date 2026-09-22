/**
 * Rounds to 2 decimal places using round-half-away-from-zero, matching PHP's
 * round() — the backend is the authoritative recalculation, but local results
 * must agree with it to the cent/decimal for the instant-UX preview to be trustworthy.
 */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
