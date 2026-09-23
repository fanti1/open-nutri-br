import { useEffect, useRef, useState, type DependencyList } from 'react';
import { subscribeToChanges, type Table } from './changes';

interface LiveQuery<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Executa uma consulta ao banco local e a repete sozinha sempre que alguma
 * das tabelas observadas mudar — é assim que listas, contadores e o painel
 * refletem uma alteração feita em outra tela sem precisar recarregar.
 */
export function useLiveQuery<T>(tables: Table[], query: () => Promise<T>, deps: DependencyList = []): LiveQuery<T> {
  const [state, setState] = useState<LiveQuery<T>>({ data: undefined, loading: true, error: null });
  const queryRef = useRef(query);
  // Antes do efeito da consulta: ele já lê a versão nova ao rodar de novo.
  useEffect(() => {
    queryRef.current = query;
  });
  const tablesKey = tables.join(',');

  useEffect(() => {
    let active = true;
    let run = 0;

    const execute = () => {
      const current = ++run;
      queryRef
        .current()
        .then((data) => active && current === run && setState({ data, loading: false, error: null }))
        .catch((error: Error) => active && current === run && setState((prev) => ({ ...prev, loading: false, error })));
    };

    execute();

    const watched = new Set(tablesKey.split(','));
    const unsubscribe = subscribeToChanges((changed) => {
      if ([...changed].some((table) => watched.has(table))) execute();
    });

    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablesKey, ...deps]);

  return state;
}
