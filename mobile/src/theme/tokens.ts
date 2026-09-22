import type { TextStyle } from 'react-native';

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  onPrimary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  child: string;
  adult: string;
  elderly: string;
  overlay: string;
}

/** Paleta própria do OpenNutri BR (verde-azulado + laranja quente), sem copiar o app de referência. */
export const lightPalette: Palette = {
  background: '#F4F7F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EAF1EF',
  border: '#DDE6E3',
  text: '#10201C',
  textMuted: '#556762',
  textSubtle: '#8A9A95',
  primary: '#0B7A69',
  onPrimary: '#FFFFFF',
  primarySoft: '#DDF1EC',
  accent: '#E8833A',
  accentSoft: '#FCEBDD',
  success: '#23925A',
  successSoft: '#DDF3E6',
  warning: '#B7791F',
  warningSoft: '#FBEFD5',
  danger: '#D1453B',
  dangerSoft: '#FBE1DF',
  info: '#2F6FDB',
  infoSoft: '#E0EAFB',
  child: '#D97706',
  adult: '#0B7A69',
  elderly: '#7C3AED',
  overlay: 'rgba(8, 20, 17, 0.45)',
};

export const darkPalette: Palette = {
  background: '#0B1311',
  surface: '#131E1B',
  surfaceAlt: '#1A2824',
  border: '#24352F',
  text: '#E7F0ED',
  textMuted: '#9DB0AA',
  textSubtle: '#6E827C',
  primary: '#3CC8AE',
  onPrimary: '#06201A',
  primarySoft: '#12352E',
  accent: '#F4A261',
  accentSoft: '#3A2717',
  success: '#4CC285',
  successSoft: '#133222',
  warning: '#E5B04B',
  warningSoft: '#352912',
  danger: '#F07167',
  dangerSoft: '#3A1917',
  info: '#6EA2F5',
  infoSoft: '#16263F',
  child: '#F5A524',
  adult: '#3CC8AE',
  elderly: '#A78BFA',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

export const typography = {
  display: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  heading: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '500' },
  small: { fontSize: 12, fontWeight: '500' },
  overline: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  metric: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
