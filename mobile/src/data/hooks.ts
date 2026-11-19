import type { CalculatorProfile } from '../domain/calculatorProfile';
import type { LifeStage } from '../domain/calculators/types';
import { useData } from './DataProvider';
import { favoritesQuery, settingsQuery } from './sharedQuery';
import { useLiveQuery } from './useLiveQuery';

/** Preferências e perfil, sempre atualizados (uma consulta só para o app inteiro). */
export function useSettings() {
  return settingsQuery.useResult();
}

/** Perfil guardado de uma calculadora (null enquanto nunca foi escolhido) e a função para salvá-lo. */
export function useCalculatorProfile(slug: string) {
  const { settings } = useData();
  const { data, loading } = useSettings();
  return {
    profile: data?.calculator_profiles[slug] ?? null,
    loading: loading && !data,
    save: (profile: CalculatorProfile) => settings.setCalculatorProfile(slug, profile),
  };
}

/** Público escolhido na aba Calculadoras — lembrado entre as sessões. */
export function useAudience(): [LifeStage, (stage: LifeStage) => void] {
  const { settings } = useData();
  const { data } = useSettings();
  return [data?.calculator_audience ?? 'adulto', (stage) => void settings.set('calculator_audience', stage)];
}

export function useFavorites() {
  return favoritesQuery.useResult();
}

export function usePatient(id: string | undefined) {
  const { patients } = useData();
  return useLiveQuery(['patients'], () => (id ? patients.get(id) : Promise.resolve(null)), [id]);
}
