/** copysign() do C: o sinal de `sign` (inclusive −0) aplicado a `magnitude`. */
function copysign(magnitude: number, sign: number): number {
  return sign < 0 || Object.is(sign, -0) ? -Math.abs(magnitude) : Math.abs(magnitude);
}

/**
 * Porte fiel de round($value, $places) do PHP ≥ 8.4 (PHP_ROUND_HALF_UP,
 * ext/standard/math.c): meio para longe do zero, tratando o double como o
 * decimal que ele representa — 20,275 → 20,28 e −62,125 → −62,13, onde
 * Math.round(x * 100) / 100 daria 20,27 e −62,12. É o arredondamento do
 * backend de referência, então app e PHPUnit concordam até a última casa,
 * inclusive quando o valor cai exatamente num ponto de corte da classificação.
 */
export function roundHalfUp(value: number, places: number): number {
  if (!Number.isFinite(value) || value === 0) return value;

  const exponent = 10 ** places;
  let integral = value >= 0 ? Math.floor(value * exponent) : Math.ceil(value * exponent);
  const next = value >= 0 ? integral + 1 : integral - 1;
  // Ex.: 0,285 × 100 = 28,499999999999996 — o inteiro de cima é o decimal pretendido.
  if (next / exponent === value) integral = next;
  if (Math.abs(integral) >= 1e16) return value;

  const edge = Math.abs((integral + copysign(0.5, integral)) / exponent);
  if (Math.abs(value) >= edge) integral += copysign(1, integral);

  // −0 vira 0: o resultado é exibido, e "−0" não tem sentido clínico.
  return integral / exponent || 0;
}

/** 2 casas decimais — o padrão dos resultados. */
export function round2(value: number): number {
  return roundHalfUp(value, 2);
}

/** 4 casas — densidade corporal (g/mL) perde informação com 2. */
export function round4(value: number): number {
  return roundHalfUp(value, 4);
}
