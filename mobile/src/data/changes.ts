export type Table =
  | 'patients'
  | 'consultations'
  | 'calculations'
  | 'attachments'
  | 'tasks'
  | 'appointments'
  | 'favorites'
  | 'settings';

type Listener = (changed: ReadonlySet<Table>) => void;

const listeners = new Set<Listener>();

/**
 * Barramento de mudanças do banco local: toda escrita avisa quais tabelas
 * mudaram, e as telas inscritas (useLiveQuery) recarregam na hora — é o que
 * deixa a interface "em tempo real" sem precisar puxar para atualizar.
 */
export function notifyChange(...tables: Table[]): void {
  const changed = new Set(tables);
  listeners.forEach((listener) => listener(changed));
}

export function subscribeToChanges(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
