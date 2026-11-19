import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { ThemePreference } from '../data/repositories/settings';
import { darkPalette, layout, lightPalette, radius, spacing, typography, type Palette } from './tokens';

export interface Theme {
  dark: boolean;
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  layout: typeof layout;
  typography: typeof typography;
}

function buildTheme(dark: boolean): Theme {
  return { dark, colors: dark ? darkPalette : lightPalette, spacing, radius, layout, typography };
}

// Dois objetos fixos: o valor do contexto só muda quando o tema muda de fato,
// e não a cada renderização do provedor (o que redesenharia o app inteiro).
const LIGHT = buildTheme(false);
const DARK = buildTheme(true);

const ThemeContext = createContext<Theme>(LIGHT);

export function ThemeProvider({ preference = 'system', children }: { preference?: ThemePreference; children: ReactNode }) {
  const system = useColorScheme();
  const dark = preference === 'dark' || (preference === 'system' && system === 'dark');

  return <ThemeContext.Provider value={dark ? DARK : LIGHT}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
