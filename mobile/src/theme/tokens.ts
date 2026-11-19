import type { TextStyle, ViewStyle } from 'react-native';

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  /** Fundo de um item pressionado ou em foco (listas, cartões tocáveis). */
  surfacePressed: string;
  border: string;
  /** Borda de campo em foco e anel de seleção. */
  borderStrong: string;
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
  /** Cabeçalho colorido das telas principais e o texto sobre ele. */
  hero: string;
  onHero: string;
  /**
   * Cores das áreas (consultório, hospital, pediatria, exames). Cada uma tem a versão
   * para texto e ícone (`coral`), o preenchimento de bloco com texto branco
   * (`coralFill`) e o fundo suave (`coralSoft`). O amarelo pede texto escuro (`onSun`).
   */
  coral: string;
  coralFill: string;
  coralSoft: string;
  sky: string;
  skyFill: string;
  skySoft: string;
  sun: string;
  sunFill: string;
  sunSoft: string;
  onSun: string;
  violet: string;
  violetFill: string;
  violetSoft: string;
}

/**
 * Paleta "Vivo" do OpenNutri BR, construída em OKLCH (espaço de cor perceptualmente uniforme):
 * - Âncora: o verde-petróleo da marca (matiz 172°).
 * - Áreas em harmonia com a âncora: coral 42°, amarelo 82°, azul 252° e violeta 298°, todas
 *   com a mesma luminosidade e croma nos blocos — nenhuma "pesa" mais que a outra.
 * - Neutros levemente puxados para o matiz da marca (cinza "quente de verde", não azulado).
 * - Escuro com paleta própria: fundo em tinta verde-petróleo, blocos menos saturados
 *   (cor saturada vibra sobre fundo escuro) e superfícies mais claras quanto mais "altas".
 * - Cores de estado separadas das de área: erro carmim (24°), aviso âmbar (62°), sucesso
 *   verde (148°, distinto do verde da marca).
 * Contraste medido (WCAG; ver theme/__tests__/contrast.test.ts): toda cor de texto passa AA
 * (4,5:1) sobre o fundo, a superfície e a própria versão "Soft"; branco passa AA sobre `hero`,
 * `primary` e os `*Fill`; `onSun` passa AA sobre `sunFill`.
 */
export const lightPalette: Palette = {
  background: '#F1F7F6',
  surface: '#FDFFFF',
  surfaceAlt: '#E6EFEE',
  surfacePressed: '#DCE7E5',
  border: '#D7E2E0',
  borderStrong: '#046E58',
  text: '#102324',
  textMuted: '#4B5F60',
  textSubtle: '#5C6D6D',
  primary: '#046E58',
  onPrimary: '#FFFFFF',
  primarySoft: '#D6F5EA',
  accent: '#AC4A1E',
  accentSoft: '#FEECE5',
  success: '#217937',
  successSoft: '#E1F7E3',
  warning: '#985704',
  warningSoft: '#FEEDDE',
  danger: '#BE222D',
  dangerSoft: '#FEEBE9',
  info: '#256BB1',
  infoSoft: '#E6F1FE',
  child: '#876204',
  adult: '#046E58',
  elderly: '#7756B1',
  overlay: 'rgba(16, 35, 36, 0.45)',
  hero: '#006E58',
  onHero: '#FFFFFF',
  coral: '#AC4A1E',
  coralFill: '#BD5629',
  coralSoft: '#FEECE5',
  sky: '#1D6CB8',
  skyFill: '#2676C6',
  skySoft: '#E6F2FF',
  sun: '#876204',
  sunFill: '#FBC044',
  sunSoft: '#FEF0D8',
  onSun: '#3D2A02',
  violet: '#7756B1',
  violetFill: '#8462C2',
  violetSoft: '#F2EDFF',
};

export const darkPalette: Palette = {
  background: '#091414',
  surface: '#121E1E',
  surfaceAlt: '#1A2828',
  surfacePressed: '#213131',
  border: '#243433',
  borderStrong: '#5ED7B5',
  text: '#E7F1F0',
  textMuted: '#AABCBA',
  textSubtle: '#91A3A1',
  primary: '#5ED7B5',
  onPrimary: '#022018',
  primarySoft: '#0C362B',
  accent: '#F39F7F',
  accentSoft: '#432519',
  success: '#7ACE87',
  successSoft: '#1B351F',
  warning: '#F2A359',
  warningSoft: '#402811',
  danger: '#FF958F',
  dangerSoft: '#442321',
  info: '#80BCFE',
  infoSoft: '#1A2F46',
  child: '#F2C36A',
  adult: '#5ED7B5',
  elderly: '#C0A8F5',
  overlay: 'rgba(0, 0, 0, 0.6)',
  hero: '#075443',
  onHero: '#FFFFFF',
  coral: '#F39F7F',
  coralFill: '#AE5937',
  coralSoft: '#432519',
  sky: '#82BCFC',
  skyFill: '#3A77B8',
  skySoft: '#1A2F46',
  sun: '#F2C36A',
  sunFill: '#E7B551',
  sunSoft: '#392B11',
  onSun: '#332405',
  violet: '#C0A8F5',
  violetFill: '#7E63B1',
  violetSoft: '#312844',
};

export type AreaColor = 'coral' | 'sky' | 'sun' | 'violet';

/** As quatro versões de uma cor de área: texto/ícone, bloco, fundo suave e texto sobre o bloco. */
export function areaColors(colors: Palette, area: AreaColor): { text: string; fill: string; soft: string; onFill: string } {
  return {
    text: colors[area],
    fill: colors[`${area}Fill`],
    soft: colors[`${area}Soft`],
    onFill: area === 'sun' ? colors.onSun : '#FFFFFF',
  };
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;

/**
 * Medidas de layout: alvo de toque mínimo (diretrizes de acessibilidade do
 * Android/iOS) e largura máxima do conteúdo — no navegador e em tablets as
 * telas ficam centralizadas em vez de esticar de ponta a ponta.
 */
export const layout = { minTouch: 44, controlHeight: 52, controlHeightSm: 44, maxContentWidth: 720 } as const;

/**
 * Nunito (arredondada, embarcada no app). Cada peso é um arquivo: o Android não
 * engrossa uma fonte própria por `fontWeight`, então o peso vira a família.
 */
export const fontFamilies = {
  400: 'Nunito_400Regular',
  500: 'Nunito_500Medium',
  600: 'Nunito_600SemiBold',
  700: 'Nunito_700Bold',
  800: 'Nunito_800ExtraBold',
  900: 'Nunito_900Black',
} as const;

export type FontWeight = keyof typeof fontFamilies;

/** "bold" / "700" / 700 → a família Nunito do peso mais próximo. */
export function fontFor(weight: TextStyle['fontWeight'] | number | undefined): string {
  const numeric = weight === 'bold' ? 700 : weight === 'normal' || weight === undefined ? 500 : Number(weight);
  const steps = Object.keys(fontFamilies).map(Number) as FontWeight[];
  const closest = steps.reduce((best, step) => (Math.abs(step - numeric) < Math.abs(best - numeric) ? step : best), 500 as FontWeight);
  return fontFamilies[closest];
}

// Algarismos de mesma largura: valores que mudam a cada tecla não "pulam" na tela.
const TABULAR: TextStyle['fontVariant'] = ['tabular-nums'];

export const typography = {
  display: { fontFamily: fontFamilies[900], fontSize: 30, lineHeight: 36, letterSpacing: -0.4 },
  title: { fontFamily: fontFamilies[900], fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  heading: { fontFamily: fontFamilies[800], fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fontFamilies[500], fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamilies[700], fontSize: 15, lineHeight: 22 },
  /** Rótulo de campo de formulário. */
  label: { fontFamily: fontFamilies[700], fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamilies[600], fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fontFamilies[600], fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fontFamilies[800], fontSize: 11, lineHeight: 15, letterSpacing: 0.6, textTransform: 'uppercase' },
  metric: { fontFamily: fontFamilies[900], fontSize: 34, lineHeight: 40, letterSpacing: -0.5, fontVariant: TABULAR },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Sombras suaves e largas no tema claro; no escuro a separação vem do tom da superfície. */
export function elevation(level: 0 | 1 | 2 | 3, dark: boolean): ViewStyle {
  if (dark || level === 0) return { shadowOpacity: 0, elevation: 0 };
  const presets = {
    1: { shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    2: { shadowOpacity: 0.1, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
    3: { shadowOpacity: 0.16, shadowRadius: 30, shadowOffset: { width: 0, height: 14 }, elevation: 10 },
  } as const;
  return { shadowColor: '#102324', ...presets[level] };
}

/** "#0A7363" + 0.12 → "#0A73631F" (cor de fundo suave a partir de uma cor de destaque). */
export function withAlpha(hex: string, alpha: number): string {
  const channel = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${channel.toUpperCase()}`;
}
