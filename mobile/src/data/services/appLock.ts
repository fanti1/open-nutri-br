import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { toBase64, fromBase64, type RandomBytes } from './backupCrypto';

/**
 * Bloqueio do app com PIN (e digital, se o aparelho tiver): protege os dados
 * dos pacientes quando o celular fica desbloqueado na mão de outra pessoa.
 * O PIN nunca é guardado — só um hash PBKDF2 com sal aleatório.
 *
 * O que segura um PIN de 4 a 6 dígitos contra tentativa e erro é a espera
 * crescente depois de erros seguidos, não o custo do hash: com 10^4–10^6
 * combinações, nenhum número de iterações impede a força bruta de quem já
 * tem o arquivo do banco — e esse arquivo, no sandbox do app, contém os
 * próprios dados. Por isso as iterações são moderadas (desbloqueio rápido no
 * celular) e o valor usado fica gravado junto do hash.
 */
export interface AppLockConfig {
  pin_hash: string;
  salt: string;
  pin_length: number;
  biometrics: boolean;
  /** Tempo em segundo plano (s) a partir do qual o app pede o PIN de novo. */
  timeout_s: number;
  /** Iterações do PBKDF2 usadas neste hash (ausente = versão inicial, 100.000). */
  iterations?: number;
  /** Erros seguidos de PIN e até quando (epoch ms) o teclado fica em espera. */
  failed_attempts?: number;
  blocked_until?: number | null;
}

export const PIN_ITERATIONS = 10_000;
const LEGACY_PIN_ITERATIONS = 100_000;
export const ATTEMPTS_BEFORE_WAIT = 5;
export const LOCK_TIMEOUTS = [
  { value: 60, label: '1 minuto' },
  { value: 300, label: '5 minutos' },
  { value: 900, label: '15 minutos' },
] as const;

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

async function hash(pin: string, salt: Uint8Array, iterations: number): Promise<string> {
  return toBase64(await pbkdf2Async(sha256, pin, salt, { c: iterations, dkLen: 32, asyncTick: 20 }));
}

export async function createLock(pin: string, randomBytes: RandomBytes, biometrics: boolean, timeout_s = 60): Promise<AppLockConfig> {
  if (!isValidPin(pin)) throw new Error('O PIN deve ter de 4 a 6 números.');
  const salt = randomBytes(16);
  return { pin_hash: await hash(pin, salt, PIN_ITERATIONS), salt: toBase64(salt), pin_length: pin.length, biometrics, timeout_s, iterations: PIN_ITERATIONS };
}

/** Compara sem atalhos (tempo constante), para não vazar informação pelo tempo de resposta. */
export async function verifyPin(pin: string, lock: AppLockConfig): Promise<boolean> {
  if (!isValidPin(pin)) return false;
  const candidate = await hash(pin, fromBase64(lock.salt), lock.iterations ?? LEGACY_PIN_ITERATIONS);
  if (candidate.length !== lock.pin_hash.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) diff |= candidate.charCodeAt(i) ^ lock.pin_hash.charCodeAt(i);
  return diff === 0;
}

/** Espera (ms) imposta ao chegar a `failures` erros seguidos: 30 s a cada 5 erros, dobrando, até 15 min. */
export function waitAfterFailures(failures: number): number {
  if (failures < ATTEMPTS_BEFORE_WAIT || failures % ATTEMPTS_BEFORE_WAIT !== 0) return 0;
  return Math.min(30_000 * 2 ** (failures / ATTEMPTS_BEFORE_WAIT - 1), 15 * 60_000);
}

/** Registra o resultado de uma tentativa: zera no acerto; no erro, conta e, se for o caso, põe o teclado em espera. */
export function recordAttempt(lock: AppLockConfig, ok: boolean, now: number): AppLockConfig {
  if (ok) return { ...lock, failed_attempts: 0, blocked_until: null };
  const failures = (lock.failed_attempts ?? 0) + 1;
  const wait = waitAfterFailures(failures);
  return { ...lock, failed_attempts: failures, blocked_until: wait ? now + wait : (lock.blocked_until ?? null) };
}

/** Segundos que ainda faltam de espera (0 = pode digitar). */
export function remainingWait(lock: AppLockConfig | null, now: number): number {
  if (!lock?.blocked_until) return 0;
  return Math.max(0, Math.ceil((lock.blocked_until - now) / 1000));
}

/** Voltou do segundo plano depois do tempo configurado? Então pede o PIN. */
export function shouldLockAfter(backgroundedAt: number | null, now: number, lock: AppLockConfig | null): boolean {
  if (!lock || backgroundedAt === null) return false;
  return now - backgroundedAt >= lock.timeout_s * 1000;
}
