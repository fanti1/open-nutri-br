import { useSyncExternalStore } from 'react';
import { subscribeToChanges, type Table } from './changes';
import type { LiveQuery } from './useLiveQuery';
import type { AppSettings } from './repositories/settings';

/**
 * Consulta global (sem parâmetros) com um resultado só, compartilhado: todas as
 * telas montadas leem o mesmo valor, e uma mudança nas tabelas observadas refaz
 * a consulta uma vez — em vez de uma ida ao banco por componente inscrito.
 * Ligada ao banco antes da primeira tela (connect), já nasce com o dado.
 */
export function createSharedQuery<T>(tables: Table[]) {
  let load: (() => Promise<T>) | null = null;
  let snapshot: LiveQuery<T> = { data: undefined, loading: true, error: null };
  let run = 0;
  const listeners = new Set<() => void>();

  const publish = (next: LiveQuery<T>) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  function refresh(): Promise<void> {
    if (!load) return Promise.resolve();
    const current = ++run;
    return load().then(
      (data) => {
        if (current === run) publish({ data, loading: false, error: null });
      },
      (error: Error) => {
        if (current === run) publish({ ...snapshot, loading: false, error });
      },
    );
  }

  subscribeToChanges((changed) => {
    if (tables.some((table) => changed.has(table))) void refresh();
  });

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const getSnapshot = () => snapshot;

  return {
    /** Liga a consulta ao banco aberto e espera o primeiro resultado. */
    connect(loader: () => Promise<T>): Promise<void> {
      load = loader;
      return refresh();
    },

    /** Valor atual, fora de componentes. */
    current: getSnapshot,

    useResult(): LiveQuery<T> {
      return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    },
  };
}

/** Preferências e perfil — lidos por quase toda tela (tema, bloqueio, perfil das calculadoras). */
export const settingsQuery = createSharedQuery<AppSettings>(['settings']);

/** Calculadoras favoritas (Início, Calculadoras e cada calculadora). */
export const favoritesQuery = createSharedQuery<string[]>(['favorites']);
