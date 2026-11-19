import { Platform } from 'react-native';
import { APP_VERSION } from './constants';

/**
 * Registro de erros inesperados, só no aparelho, para o "Relatar um problema".
 * Nada sai daqui sozinho: o profissional vê o texto e decide se o envia.
 */
export interface ErrorEntry {
  at: string;
  message: string;
  /** Primeiras linhas da pilha, para localizar o erro no código. */
  stack: string | null;
  /** Tela em que aconteceu (rota, sem parâmetros de busca). */
  route: string | null;
  appVersion: string;
}

export const MAX_ERROR_ENTRIES = 20;
const MAX_MESSAGE = 300;
const STACK_LINES = 5;

export function makeErrorEntry(error: unknown, route: string | null, now = new Date()): ErrorEntry {
  const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : String(error));
  const message = (err.message || err.name || 'Erro sem mensagem').trim();
  const stack = err.stack
    ? err.stack
        .split('\n')
        .map((line) => line.trim())
        // V8 e Hermes repetem "Erro: mensagem" na primeira linha; a mensagem já vai à parte.
        .filter((line, index) => line && !(index === 0 && (line === err.name || line.startsWith(`${err.name}:`))))
        .slice(0, STACK_LINES)
        .join('\n')
    : '';

  return {
    at: now.toISOString(),
    message: message.length > MAX_MESSAGE ? `${message.slice(0, MAX_MESSAGE)}…` : message,
    stack: stack || null,
    route,
    appVersion: APP_VERSION,
  };
}

/** Mais recente primeiro; o mesmo erro repetido em sequência não ocupa várias posições. */
export function appendErrorEntry(entries: ErrorEntry[], entry: ErrorEntry): ErrorEntry[] {
  const [last] = entries;
  if (last && last.message === entry.message && last.route === entry.route && last.stack === entry.stack) {
    return [entry, ...entries.slice(1)];
  }
  return [entry, ...entries].slice(0, MAX_ERROR_ENTRIES);
}

type Save = (entries: ErrorEntry[]) => Promise<void>;

let entries: ErrorEntry[] = [];
let save: Save | null = null;
let currentRoute: string | null = null;

function persist() {
  save?.(entries).catch(() => {
    // Gravar o registro nunca pode virar um segundo erro.
  });
}

export const errorLog = {
  record(error: unknown): void {
    entries = appendErrorEntry(entries, makeErrorEntry(error, currentRoute));
    persist();
  },

  /** Liga o registro ao banco quando ele abre; erros anteriores (ex.: o banco não abriu) ficam e são gravados. */
  attach(stored: ErrorEntry[], saveEntries: Save): void {
    const pending = entries;
    entries = stored;
    for (const entry of [...pending].reverse()) entries = appendErrorEntry(entries, entry);
    save = saveEntries;
    if (pending.length) persist();
  },

  list(): ErrorEntry[] {
    return entries;
  },

  clear(): void {
    entries = [];
    persist();
  },

  setRoute(route: string | null): void {
    currentRoute = route;
  },
};

interface RnErrorUtils {
  getGlobalHandler(): (error: unknown, isFatal?: boolean) => void;
  setGlobalHandler(handler: (error: unknown, isFatal?: boolean) => void): void;
}

let installed = false;

/** Captura erros fora da árvore do React (callbacks, promessas). Mantém o comportamento original. */
export function installGlobalErrorHandlers(): void {
  if (installed) return;
  installed = true;

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    window.addEventListener('error', (event) => errorLog.record(event.error ?? event.message));
    window.addEventListener('unhandledrejection', (event) => errorLog.record(event.reason));
    return;
  }

  const utils = (globalThis as { ErrorUtils?: RnErrorUtils }).ErrorUtils;
  if (!utils) return;
  const previous = utils.getGlobalHandler();
  utils.setGlobalHandler((error, isFatal) => {
    errorLog.record(error);
    previous(error, isFatal);
  });
}
