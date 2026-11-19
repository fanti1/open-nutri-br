/**
 * Comparação de um valor *calculado* com um ponto de corte, imune ao ruído de
 * ponto flutuante: 76,8 kg / 1,60 m² dá 29,999999999999993 no computador, mas é
 * IMC 30 — e tem de contar como "≥ 30". A tolerância (1e-9) é muitas ordens de
 * grandeza menor que a precisão de qualquer medida clínica, então nenhum corte
 * muda; só deixa de decidir o erro de representação. Espelho de
 * backend/app/Domain/Calculators/Support/Cutoff.php.
 */
const EPSILON = 1e-9;

/** value ≥ cutoff */
export function reaches(value: number, cutoff: number): boolean {
  return value >= cutoff - EPSILON;
}

/** value > cutoff */
export function exceeds(value: number, cutoff: number): boolean {
  return value > cutoff + EPSILON;
}
