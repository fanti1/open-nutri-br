import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { button, DEMO_BACKUP, expect, onboard, openTab, test, withDemoData, toast } from '../fixtures';

/** Gera o backup pela tela e devolve o arquivo baixado (no navegador, o backup é um download). */
async function exportBackup(page: Page, password?: string): Promise<{ name: string; text: string }> {
  await page.goto('/backup');
  const protect = page.getByRole('checkbox', { name: 'Proteger o arquivo com senha (recomendado)' });
  if (!password) await protect.click();
  else {
    await page.getByLabel('Senha do backup', { exact: true }).fill(password);
    await page.getByLabel('Repita a senha', { exact: true }).fill(password);
  }
  const download = page.waitForEvent('download');
  await button(page, 'Salvar backup no Google Drive').click();
  const file = await download;
  return { name: file.suggestedFilename(), text: await readFile((await file.path())!, 'utf8') };
}

/** Restaura um arquivo num app limpo (outra "instalação"). */
async function restoreInFreshApp(page: Page, file: { name: string; text: string }, password?: string): Promise<void> {
  await page.context().clearCookies();
  await onboard(page, 'Outra');
  await page.goto('/backup');
  const chooser = page.waitForEvent('filechooser');
  page.once('dialog', (dialog) => dialog.accept());
  await button(page, 'Restaurar do Google Drive').click();
  await (await chooser).setFiles({ name: file.name, mimeType: 'application/json', buffer: Buffer.from(file.text) });
  if (password) {
    await page.getByLabel('Senha do arquivo a restaurar', { exact: true }).fill(password);
    await button(page, 'Restaurar').click();
  }
}

test.describe('Backup e restauração', () => {
  test('backup protegido: senhas precisam conferir; o arquivo vai cifrado, sem dados legíveis', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/backup');
    await page.getByLabel('Senha do backup', { exact: true }).fill('senha-forte-1');
    await page.getByLabel('Repita a senha', { exact: true }).fill('outra-senha');
    await expect(page.getByText('As senhas não conferem.')).toBeVisible();

    const file = await exportBackup(page, 'senha-forte-1');
    expect(file.name).toMatch(/^opennutri-backup-\d{4}-\d{2}-\d{2}-protegido\.json$/);
    expect(JSON.parse(file.text).format).toBe('opennutri-br-backup-cifrado');
    expect(file.text).not.toContain('Beatriz');
    await expect(toast(page, 'Backup protegido com senha gerado')).toBeVisible();
    await expect(page.getByText(/^Último backup: /)).toBeVisible();
  });

  test('restaurar backup protegido: senha errada é recusada, a certa traz tudo de volta', async ({ browser }) => {
    const origin = await browser.newPage();
    await withDemoData(origin);
    const file = await exportBackup(origin, 'senha-forte-1');
    await origin.close();

    const context = await browser.newContext();
    const page = await context.newPage();
    await restoreInFreshApp(page, file, 'senha-errada');
    await expect(page.getByText(/senha incorreta|não foi possível abrir/i)).toBeVisible();
    await page.getByLabel('Senha do arquivo a restaurar', { exact: true }).fill('senha-forte-1');
    await button(page, 'Restaurar').click();
    await expect(toast(page, 'Backup restaurado')).toBeVisible();
    await openTab(page, 'Pacientes');
    await expect(page.getByText('5 fichas')).toBeVisible();
    await context.close();
  });

  test('backup sem senha é um JSON legível do OpenNutri BR e restaura em outro aparelho', async ({ browser }) => {
    const origin = await browser.newPage();
    await withDemoData(origin);
    const file = await exportBackup(origin);
    await origin.close();
    expect(JSON.parse(file.text).format).toBe('opennutri-br-backup');

    const context = await browser.newContext();
    const page = await context.newPage();
    await restoreInFreshApp(page, file);
    await expect(toast(page, 'Backup restaurado')).toBeVisible();
    await page.goto('/');
    await expect(page.getByText(/, Ana!/)).toBeVisible(); // o perfil veio junto
    await context.close();
  });

  test('restaurar pede confirmação; cancelar não muda nada', async ({ page }) => {
    await onboard(page);
    await page.goto('/backup');
    page.once('dialog', (dialog) => dialog.dismiss());
    await button(page, 'Restaurar do Google Drive').click();
    await openTab(page, 'Pacientes');
    await expect(page.getByText('Nenhum paciente ainda')).toBeVisible();
  });

  test('arquivo que não é backup é recusado com explicação, sem apagar nada', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/backup');
    const chooser = page.waitForEvent('filechooser');
    page.once('dialog', (dialog) => dialog.accept()); // confirmação
    await button(page, 'Restaurar do Google Drive').click();
    const alert = page.waitForEvent('dialog');
    await (await chooser).setFiles({ name: 'foto.json', mimeType: 'application/json', buffer: Buffer.from('{"qualquer": "coisa"}') });
    const message = await alert;
    expect(message.message()).toContain('não é um backup válido do OpenNutri BR');
    await message.accept();
    await openTab(page, 'Pacientes');
    await expect(page.getByText('5 fichas')).toBeVisible();
  });

  test('o backup fictício dos testes continua compatível com o app', async ({ page }) => {
    const backup = JSON.parse(await readFile(DEMO_BACKUP, 'utf8'));
    expect(backup.format).toBe('opennutri-br-backup');
    await withDemoData(page);
    await openTab(page, 'Pacientes');
    await expect(page.getByText('5 fichas')).toBeVisible();
  });
});
