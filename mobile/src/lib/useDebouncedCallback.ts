import { useCallback, useEffect, useRef } from 'react';

/**
 * Agenda `callback` para depois de `delayMs` sem novas chamadas. O que estiver
 * pendente é executado na hora ao desmontar (ex.: o usuário digitou e voltou
 * para a tela anterior sem sair do campo) ou ao chamar `flush`.
 */
export function useDebouncedCallback<T>(callback: (value: T) => void, delayMs = 600) {
  const latest = useRef(callback);
  useEffect(() => {
    latest.current = callback;
  });
  const pending = useRef<{ value: T; timer: ReturnType<typeof setTimeout> } | null>(null);

  const flush = useCallback(() => {
    if (!pending.current) return;
    clearTimeout(pending.current.timer);
    const { value } = pending.current;
    pending.current = null;
    latest.current(value);
  }, []);

  const schedule = useCallback(
    (value: T) => {
      if (pending.current) clearTimeout(pending.current.timer);
      pending.current = { value, timer: setTimeout(flush, delayMs) };
    },
    [delayMs, flush],
  );

  useEffect(() => flush, [flush]);

  return { schedule, flush };
}
