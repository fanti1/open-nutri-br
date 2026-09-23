import { IncompleteInputsError } from '../calculators/types';

/**
 * Motor dos escores-Z da OMS — espelho de backend/app/Domain/Growth, que por
 * sua vez replica o código-fonte dos pacotes oficiais `anthro` e `anthroplus`.
 * Roda no aparelho, com as tabelas oficiais embarcadas (src/data/who).
 */

/** Parâmetros LMS de uma linha da tabela (L = Box-Cox, M = mediana, S = coef. de variação). */
export interface Lms {
  l: number;
  m: number;
  s: number;
}

/** A medida/idade está fora da faixa da curva — a mensagem é mostrada ao usuário. */
export class OutOfReferenceRangeError extends IncompleteInputsError {}

export type WhoTableName =
  | 'weianthro'
  | 'lenanthro'
  | 'bmianthro'
  | 'hcanthro'
  | 'wflanthro'
  | 'wfhanthro'
  | 'wfawho2007'
  | 'hfawho2007'
  | 'bfawho2007';

interface WhoTable {
  scale: number;
  sexes: Record<string, { start: number; rows: Array<[number, number, number]> }>;
}

/* eslint-disable @typescript-eslint/no-require-imports */
// Carregadas sob demanda: só a tabela usada é lida da memória do app.
const LOADERS: Record<WhoTableName, () => WhoTable> = {
  weianthro: () => require('../../data/who/weianthro.json'),
  lenanthro: () => require('../../data/who/lenanthro.json'),
  bmianthro: () => require('../../data/who/bmianthro.json'),
  hcanthro: () => require('../../data/who/hcanthro.json'),
  wflanthro: () => require('../../data/who/wflanthro.json'),
  wfhanthro: () => require('../../data/who/wfhanthro.json'),
  wfawho2007: () => require('../../data/who/wfawho2007.json'),
  hfawho2007: () => require('../../data/who/hfawho2007.json'),
  bfawho2007: () => require('../../data/who/bfawho2007.json'),
};
/* eslint-enable @typescript-eslint/no-require-imports */

const cache = new Map<WhoTableName, WhoTable>();

function table(name: WhoTableName): WhoTable {
  let loaded = cache.get(name);
  if (!loaded) {
    loaded = LOADERS[name]();
    cache.set(name, loaded);
  }
  return loaded;
}

/** Código de sexo das tabelas da OMS: 1 = masculino, 2 = feminino. */
export function whoSex(sex: string): 1 | 2 {
  return sex === 'male' ? 1 : 2;
}

/** Linha exata da tabela (ex.: idade em dias). */
export function exactLms(name: WhoTableName, sex: 1 | 2, key: number): Lms | null {
  const data = table(name).sexes[String(sex)];
  const row = data?.rows[key - data.start];
  return row ? { l: row[0], m: row[1], s: row[2] } : null;
}

/**
 * Interpolação linear entre os pontos vizinhos, como os pacotes da OMS:
 * inferior = trunc(x), superior = trunc(x) + 1, fração = x − inferior (na escala da chave).
 */
export function interpolatedLms(name: WhoTableName, sex: 1 | 2, x: number, keyScale: number): Lms | null {
  const scaled = x * keyScale;
  const lowerKey = Math.trunc(scaled);
  const fraction = scaled - lowerKey;
  const lower = exactLms(name, sex, lowerKey);

  if (!lower) return null;
  if (fraction <= 0) return lower;

  const upper = exactLms(name, sex, lowerKey + 1);
  if (!upper) return null;

  return {
    l: lower.l + fraction * (upper.l - lower.l),
    m: lower.m + fraction * (upper.m - lower.m),
    s: lower.s + fraction * (upper.s - lower.s),
  };
}

export const DAYS_PER_MONTH = 30.4375;
/** Limite (dias) a partir do qual a criança deve ser medida em pé. */
export const STANDING_FROM_DAYS = 731;

/** Idade em dias com arredondamento de meia unidade para cima, como round_up() da OMS. */
export function ageInDays(ageMonths: number): number {
  const days = ageMonths * DAYS_PER_MONTH;
  const floor = Math.floor(days);
  return days - floor >= 0.5 ? floor + 1 : floor;
}

/**
 * < 2 anos referenciados deitados (comprimento), ≥ 2 anos em pé (estatura);
 * correção de 0,7 cm quando a posição medida difere da esperada. Medida em pé
 * antes dos 9 meses é implausível e não é corrigida.
 */
export function standardizedLength(lengthCm: number, position: string, ageMonths: number): number {
  const days = ageInDays(ageMonths);
  if (position === 'em_pe' && ageMonths < 9) return lengthCm;
  if (days < STANDING_FROM_DAYS && position === 'em_pe') return lengthCm + 0.7;
  if (days >= STANDING_FROM_DAYS && position === 'deitado') return lengthCm - 0.7;
  return lengthCm;
}

/** Escore-Z pelo método LMS. WHO Child Growth Standards: Methods and development, 2006, cap. 7. */
export function zScore(y: number, lms: Lms): number {
  return ((y / lms.m) ** lms.l - 1) / (lms.s * lms.l);
}

export function valueAtZ(z: number, lms: Lms): number {
  return lms.m * (1 + lms.l * lms.s * z) ** (1 / lms.l);
}

/** Escore "restrito" dos indicadores de peso: além de ±3 DP, usa a distância entre 2 e 3 DP. */
export function zScoreAdjusted(y: number, lms: Lms): number {
  const z = zScore(y, lms);

  if (z > 3) {
    const sd3pos = valueAtZ(3, lms);
    return 3 + (y - sd3pos) / (sd3pos - valueAtZ(2, lms));
  }
  if (z < -3) {
    const sd3neg = valueAtZ(-3, lms);
    return -3 + (y - sd3neg) / (valueAtZ(-2, lms) - sd3neg);
  }
  return z;
}
