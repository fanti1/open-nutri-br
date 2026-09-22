import { useData } from './DataProvider';
import { useLiveQuery } from './useLiveQuery';

/** Preferências e perfil, sempre atualizados. */
export function useSettings() {
  const { settings } = useData();
  return useLiveQuery(['settings'], () => settings.all());
}

export function useFavorites() {
  const { settings } = useData();
  return useLiveQuery(['favorites'], () => settings.favoriteSlugs());
}

export function usePatient(id: string | undefined) {
  const { patients } = useData();
  return useLiveQuery(['patients'], () => (id ? patients.get(id) : Promise.resolve(null)), [id]);
}
