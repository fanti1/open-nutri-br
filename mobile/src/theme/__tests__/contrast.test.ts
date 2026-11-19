import { darkPalette, fontFor, lightPalette, type Palette } from '../tokens';

/** Razão de contraste da WCAG 2.x entre duas cores #RRGGBB. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const TEXT: (keyof Palette)[] = ['text', 'textMuted', 'textSubtle', 'primary', 'accent', 'success', 'warning', 'danger', 'info', 'child', 'adult', 'elderly', 'coral', 'sky', 'sun', 'violet'];
const OWN_SOFT: Partial<Record<keyof Palette, keyof Palette>> = {
  primary: 'primarySoft',
  accent: 'accentSoft',
  success: 'successSoft',
  warning: 'warningSoft',
  danger: 'dangerSoft',
  info: 'infoSoft',
  coral: 'coralSoft',
  sky: 'skySoft',
  sun: 'sunSoft',
  violet: 'violetSoft',
};

describe.each([
  ['claro', lightPalette],
  ['escuro', darkPalette],
])('tema %s: contraste AA (4,5:1)', (_, colors) => {
  it.each(TEXT)('%s sobre fundo, superfície e superfície alternativa', (key) => {
    for (const background of [colors.background, colors.surface, colors.surfaceAlt]) {
      expect(contrast(colors[key], background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('cores de texto sobre a própria versão suave', () => {
    const failing = (Object.entries(OWN_SOFT) as [keyof Palette, keyof Palette][]).filter(([key, soft]) => contrast(colors[key], colors[soft]) < 4.5);
    expect(failing).toEqual([]);
  });

  it('texto sobre os blocos coloridos', () => {
    expect(contrast(colors.onHero, colors.hero)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(4.5);
    for (const fill of [colors.coralFill, colors.skyFill, colors.violetFill]) expect(contrast('#FFFFFF', fill)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.onSun, colors.sunFill)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('fonte por peso', () => {
  it('escolhe o arquivo da Nunito mais próximo do peso pedido', () => {
    expect(fontFor('bold')).toBe('Nunito_700Bold');
    expect(fontFor('600')).toBe('Nunito_600SemiBold');
    expect(fontFor(undefined)).toBe('Nunito_500Medium');
    expect(fontFor('normal')).toBe('Nunito_500Medium');
    expect(fontFor(900)).toBe('Nunito_900Black');
    expect(fontFor('300')).toBe('Nunito_400Regular');
  });
});
