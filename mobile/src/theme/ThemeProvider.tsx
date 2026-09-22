import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { ThemePreference } from '../data/repositories/settings';
import { darkPalette, lightPalette, radius, spacing, typography, type Palette } from './tokens';

export interface Theme {
  dark: boolean;
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

function buildTheme(dark: boolean): Theme {
  return { dark, colors: dark ? darkPalette : lightPalette, spacing, radius, typography };
}

const ThemeContext = createContext<Theme>(buildTheme(false));

export function ThemeProvider({ preference = 'system', children }: { preference?: ThemePreference; children: ReactNode }) {
  const system = useColorScheme();
  const dark = preference === 'dark' || (preference === 'system' && system === 'dark');

  return <ThemeContext.Provider value={buildTheme(dark)}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
