import { defineConfig } from '@playwright/test';

/**
 * Testes ponta a ponta do app no navegador (o mesmo código do Android e do iOS,
 * renderizado pelo react-native-web), sobre o build de produção.
 *
 * - Local: usa o Edge (Windows) ou o Chrome instalado, sem janela e sem baixar navegador.
 * - E2E_URL aponta para um servidor já rodando (ex.: `npm run web` → http://localhost:8081).
 * Veja docs/DESENVOLVIMENTO.md.
 */
const PORT = Number(process.env.E2E_PORT ?? 8099);
const external = !!process.env.E2E_URL;

export default defineConfig({
  testDir: 'e2e/web/specs',
  outputDir: 'e2e/web/test-results',
  // Cada teste começa num navegador limpo (banco do app vazio): podem rodar em paralelo.
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'e2e/web/report' }]] : [['list']],
  use: {
    baseURL: process.env.E2E_URL ?? `http://localhost:${PORT}`,
    channel: process.env.E2E_BROWSER ?? (process.platform === 'win32' ? 'msedge' : 'chrome'),
    headless: true,
    viewport: { width: 412, height: 915 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: external
    ? undefined
    : {
        command: `npx expo export --platform web --output-dir dist-e2e && node e2e/web/server.mjs ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
        env: { CI: '1' },
      },
});
