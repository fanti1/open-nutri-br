import { expect, test as base, type Page } from '@playwright/test';
import { join } from 'node:path';

/** Backup com dados FICTÍCIOS (pacientes, atendimentos, cálculos, plano, agenda, tarefa). */
export const DEMO_BACKUP = join(__dirname, 'demo-backup.json');

declare global {
  interface Window {
    __printed?: string[];
    __opened?: string[];
    __copied?: string[];
  }
}

/**
 * Página do app com três garantias verificadas ao fim de TODO teste:
 * nenhuma requisição para fora (o app é 100% offline), nenhum erro de JavaScript
 * e nenhum erro no console. Impressão, links externos e área de transferência
 * são registrados para o teste conferir, em vez de abrir janelas.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const problems: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(url.hostname)) problems.push(`requisição externa: ${request.url()}`);
    });
    page.on('pageerror', (error) => problems.push(`erro de JavaScript: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(`console: ${message.text().slice(0, 300)}`);
    });

    await page.addInitScript(() => {
      const top = window.top ?? window;
      // Roda também nos iframes: o HTML impresso (PDF na web) é o do documento que chamou print().
      window.print = () => {
        top.__printed = [...(top.__printed ?? []), document.documentElement.outerHTML];
      };
      window.open = ((url?: string | URL) => {
        top.__opened = [...(top.__opened ?? []), String(url)];
        return null;
      }) as typeof window.open;
      // Como num computador sem compartilhamento nativo (Chrome no Linux, Firefox): o app copia o texto.
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
      if (navigator.clipboard) {
        navigator.clipboard.writeText = async (text: string) => {
          top.__copied = [...(top.__copied ?? []), text];
        };
      }
    });

    await use(page);
    expect(problems, 'O app não pode fazer requisições externas nem registrar erros').toEqual([]);
  },
});

export { expect };

/** Primeiro acesso completo (perfil + aceite da privacidade). */
export async function onboard(page: Page, name = 'Ana'): Promise<void> {
  await page.goto('/');
  await page.getByText('Começar', { exact: true }).click();
  await page.getByLabel('Como quer ser chamado(a)?').fill(name);
  await page.getByText('Continuar', { exact: true }).click();
  await page.getByText('Li e concordo com a política de privacidade.').click();
  await page.getByText('Aceitar e entrar', { exact: true }).click();
  await expect(page.getByText(new RegExp(`, ${name}!`))).toBeVisible();
}

/** Restaura o backup fictício pela tela de Backup, como o usuário faria. */
export async function restoreDemo(page: Page): Promise<void> {
  await page.goto('/backup');
  const chooser = page.waitForEvent('filechooser');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByText('Restaurar do Google Drive').click();
  await (await chooser).setFiles(DEMO_BACKUP);
  await expect(toast(page, 'Backup restaurado')).toBeVisible();
}

/** App pronto com os dados fictícios. */
export async function withDemoData(page: Page): Promise<void> {
  await onboard(page);
  await restoreDemo(page);
}

const TAB_ROUTES = { Início: '/', Calculadoras: '/calculadoras', Pacientes: '/pacientes', Agenda: '/agenda', Mais: '/mais' } as const;

/**
 * Aba da barra inferior. Fora das abas (ex.: na tela de Backup) a barra não existe:
 * aí o teste navega direto para a aba.
 */
export async function openTab(page: Page, name: keyof typeof TAB_ROUTES): Promise<void> {
  const tab = page.getByRole('tab', { name, exact: true });
  if (await tab.isVisible()) await tab.click();
  else await page.goto(TAB_ROUTES[name]);
}

/** Aviso passageiro (toast) com o texto: procura só dentro do aviso, não no resto da tela. */
export function toast(page: Page, text: string | RegExp) {
  return page.getByRole('alert').filter({ hasText: text });
}

/** Botão pelo nome acessível (o que o leitor de tela anuncia). */
export function button(page: Page, name: string | RegExp) {
  return page.getByRole('button', { name, exact: typeof name === 'string' });
}

/** Responde à próxima confirmação do navegador (window.confirm na web). */
export function answerNextDialog(page: Page, accept: boolean): void {
  page.once('dialog', (dialog) => (accept ? dialog.accept() : dialog.dismiss()));
}

/** Data de hoje + n dias no formato dd/mm/aaaa do app. */
export function brDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Preenche um campo de data (e hora) do app: abre o calendário pelo rótulo do campo,
 * digita a data, escolhe hora e minuto (campos com hora) e confirma.
 */
export async function pickDate(page: Page, label: string, date: string, time?: { hour: string; minute: string }): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^${label}, `) }).click();
  await page.getByLabel('Digitar a data', { exact: true }).fill(date.replace(/\D/g, ''));
  if (time) {
    await page.getByRole('radio', { name: `${time.hour}h`, exact: true }).click();
    await page.getByRole('radio', { name: `:${time.minute}`, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
}
