import type { CalculatorProfile } from '../domain/calculatorProfile';
import { useData } from './DataProvider';
import { useLiveQuery } from './useLiveQuery';

/** Preferências e perfil, sempre atualizados. */
export function useSettings() {
  const { settings } = useData();
  return useLiveQuery(['settings'], () => settings.all());
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

export function useFavorites() {
  const { settings } = useData();
  return useLiveQuery(['favorites'], () => settings.favoriteSlugs());
}

export function usePatient(id: string | undefined) {
  const { patients } = useData();
  return useLiveQuery(['patients'], () => (id ? patients.get(id) : Promise.resolve(null)), [id]);
}
