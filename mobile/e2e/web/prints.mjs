// Prints do README (docs/screenshots/{claro,escuro}) a partir do app no navegador.
// Restaura um backup com dados FICTÍCIOS (demo-backup.json) pela tela de Backup, como um usuário faria,
// e confere que o app não fez nenhuma requisição externa nem registrou erro no console.
//
// Uso: em um terminal, `npm run web`; em outro, `npm run prints`.
// Usa o Edge ou o Chrome instalado (PRINTS_BROWSER=chrome|msedge), sem baixar navegador.
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.PRINTS_URL ?? 'http://localhost:8081';
const BACKUP = join(here, 'demo-backup.json');
const CHANNEL = process.env.PRINTS_BROWSER ?? (process.platform === 'win32' ? 'msedge' : 'chrome');
const browser = await chromium.launch({ channel: CHANNEL, headless: true });
let failed = false;

for (const [scheme, folder] of [['light', 'claro'], ['dark', 'escuro']]) {
  const out = join(here, '../../../docs/screenshots', folder);
  mkdirSync(out, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', colorScheme: scheme });
  const page = await context.newPage();
  const problems = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(url.hostname)) problems.push(`requisição externa: ${request.url()}`);
  });
  page.on('console', (message) => message.type() === 'error' && problems.push(`console: ${message.text().slice(0, 300)}`));
  page.on('pageerror', (error) => problems.push(`erro: ${error.message}`));
  page.on('dialog', (dialog) => dialog.accept());

  const shot = async (name) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(out, `${name}.png`) });
    console.log(`${folder}/${name}.png`);
  };
  const visit = async (path, text) => {
    await page.goto(BASE + path);
    if (text) await page.getByText(text).first().waitFor();
  };

  // Primeiro acesso e restauração do backup fictício.
  await page.goto(BASE);
  await page.getByText('Começar', { exact: true }).click();
  await page.getByLabel('Como quer ser chamado(a)?').fill('Ana');
  await page.getByText('Continuar', { exact: true }).click();
  await page.getByText('Li e concordo com a política de privacidade.').click();
  await page.getByText('Aceitar e entrar', { exact: true }).click();
  await page.getByText(/, Ana!/).waitFor();
  await visit('/backup', 'Restaurar do Google Drive');
  const chooser = page.waitForEvent('filechooser');
  await page.getByText('Restaurar do Google Drive').click();
  await (await chooser).setFiles(BACKUP);
  await page.getByText('Backup restaurado').waitFor();

  await visit('/', 'Pacientes recentes');
  await shot('01-inicio');

  await visit('/calculadoras', 'Para quem é o cálculo?');
  await shot('02-calculadoras');

  // Na primeira vez a calculadora pede o perfil (faixa e sexo) antes do formulário.
  await visit('/calculadora/imc', 'Índice de Massa Corporal');
  await page.waitForTimeout(500);
  for (const text of ['Feminino', 'Usar este perfil']) {
    const option = page.getByText(text, { exact: true }).first();
    if (await option.isVisible().catch(() => false)) await option.click();
  }
  await page.getByLabel(/^Peso/).first().fill('77,5');
  await page.getByLabel(/^Altura/).first().fill('1,64');
  await page.getByText('Dados do cálculo').first().click();
  await shot('03-calculadora');

  await visit('/pacientes', 'Beatriz Lima');
  await page.getByText('Beatriz Lima').first().click();
  await page.getByText('Evolução').waitFor();
  await shot('04-ficha');

  await visit('/planos', 'Plano alimentar — outubro');
  await page.getByText('Plano alimentar — outubro').first().click();
  await page.getByText('Exportar PDF').first().waitFor();
  await shot('05-plano');

  await visit('/ajuda', 'Guias');
  await shot('06-ajuda');

  await visit('/sobre', 'Licenças de código aberto');
  await shot('07-sobre');

  if (problems.length) {
    failed = true;
    console.error(`Problemas no tema ${folder}:\n  ${problems.join('\n  ')}`);
  }
  await context.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
