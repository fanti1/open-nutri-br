// Gera o ícone do app em todos os formatos a partir de uma única definição:
// assets/icon.svg (fonte vetorial), icon.png (1024, iOS e lojas), as camadas do ícone
// adaptativo do Android (fundo, primeiro plano e monocromático) e o favicon da versão web.
// As cores são as da paleta (src/theme/tokens.ts), calculadas em OKLCH na mesma família:
// verde-petróleo da marca (matiz 172°) e folha do coral ao âmbar (42° → 70°).
// Uso: node scripts/build-icons.mjs   (usa o Edge ou o Chrome instalado, sem janela)
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const COLORS = {
  backgroundStart: '#089678',
  backgroundEnd: '#046450',
  leafStart: '#E56731',
  leafEnd: '#FEB354',
  mark: '#FFFFFF',
};

const assets = join(dirname(fileURLToPath(import.meta.url)), '../assets');

/** O desenho: anel aberto ("Open") com cabinho e folha ("Nutri"), num quadro de 1000. */
function glyph({ monochrome = false } = {}) {
  const leaf = monochrome ? COLORS.mark : 'url(#leaf)';
  const vein = monochrome ? '' : `<path d="M534.3,224.9 L631.7,120.5" stroke="${COLORS.mark}" stroke-opacity="0.45" stroke-width="12" stroke-linecap="round"/>`;
  return `<path d="M595.6,345.3 A235,235 0 1 1 404.4,345.3" fill="none" stroke="${COLORS.mark}" stroke-width="94" stroke-linecap="round"/><path d="M500.0,333.0 Q494.0,293.0 510.0,251.0" fill="none" stroke="${COLORS.mark}" stroke-width="42" stroke-linecap="round"/><path d="M510.0,251.0 Q664.2,203.0 683.9,64.5 Q512.4,131.2 510.0,251.0 Z" fill="${leaf}"/>${vein}`;
}

const defs = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${COLORS.backgroundStart}"/><stop offset="1" stop-color="${COLORS.backgroundEnd}"/></linearGradient><linearGradient id="leaf" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${COLORS.leafStart}"/><stop offset="1" stop-color="${COLORS.leafEnd}"/></linearGradient></defs>`;
const background = '<rect width="1000" height="1000" fill="url(#bg)"/>';
// Ícone cheio: o desenho ocupa o quadro (como no ícone original).
const full = `<g transform="translate(52.4 96.3) scale(0.8951)">${glyph()}</g>`;
// Camadas do Android: o desenho cabe na zona segura do ícone adaptativo (≈ 74% do quadro, centralizado).
const safe = (inner) => `<g transform="translate(130 130) scale(0.74)"><g transform="translate(52.4 96.3) scale(0.8951)">${inner}</g></g>`;

const svg = (body, size = 1024) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1000 1000">${defs}${body}</svg>`;

const OUTPUTS = [
  { file: 'icon.png', size: 1024, body: background + full },
  { file: 'favicon.png', size: 48, body: background + full },
  { file: 'android-icon-background.png', size: 512, body: background },
  { file: 'android-icon-foreground.png', size: 512, body: safe(glyph()), transparent: true },
  { file: 'android-icon-monochrome.png', size: 432, body: safe(glyph({ monochrome: true })), transparent: true },
];

writeFileSync(join(assets, 'icon.svg'), svg(background + full));

const browser = await chromium.launch({ channel: process.env.PRINTS_BROWSER ?? (process.platform === 'win32' ? 'msedge' : 'chrome'), headless: true });
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const { file, size, body, transparent } of OUTPUTS) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(body, size)}</body></html>`);
  await page.locator('svg').screenshot({ path: join(assets, file), omitBackground: !!transparent });
  console.log(`assets/${file} (${size}×${size})`);
}
await browser.close();
