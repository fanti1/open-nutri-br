import type { Page } from '@playwright/test';
import { button, expect, onboard, test, toast } from '../fixtures';

/** Digita um PIN no teclado numérico do app. */
async function typePin(page: Page, pin: string): Promise<void> {
  for (const digit of pin) await page.getByRole('button', { name: digit, exact: true }).click();
}

async function enableLock(page: Page, pin: string): Promise<void> {
  await page.goto('/seguranca');
  await button(page, 'Ativar bloqueio com PIN').click();
  await typePin(page, pin);
  await button(page, 'Continuar').click();
  await typePin(page, pin);
  await expect(toast(page, 'Bloqueio ativado')).toBeVisible();
}

test.describe('Segurança: bloqueio com PIN', () => {
  test('ativar o PIN: confirmação diferente é recusada', async ({ page }) => {
    await onboard(page);
    await page.goto('/seguranca');
    await button(page, 'Ativar bloqueio com PIN').click();
    await typePin(page, '2580');
    await button(page, 'Continuar').click();
    await typePin(page, '1111');
    await expect(page.getByText('Os PINs não conferem. Digite de novo.')).toBeVisible();
  });

  test('com o bloqueio, o app abre trancado; PIN errado não entra, o certo entra', async ({ page }) => {
    await onboard(page);
    await enableLock(page, '2580');

    await page.goto('/');
    await expect(page.getByText('OpenNutri BR bloqueado')).toBeVisible();
    // Enquanto bloqueado, o conteúdo não aparece nem para o leitor de tela.
    await expect(page.getByRole('heading', { name: /, Ana!/ })).toHaveCount(0);
    // ...e fica coberto: o ponto da tela onde está a saudação pertence à tela de bloqueio.
    const greeting = page.getByText(/, Ana!/);
    const box = (await greeting.boundingBox())!;
    const covered = await greeting.evaluate((element, point) => !element.contains(document.elementFromPoint(point.x, point.y)), { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    expect(covered).toBe(true);

    await typePin(page, '1234');
    await expect(page.getByText(/PIN incorreto/)).toBeVisible();
    await typePin(page, '2580');
    await expect(page.getByText(/, Ana!/)).toBeVisible();
  });

  test('desativar o bloqueio exige o PIN atual', async ({ page }) => {
    await onboard(page);
    await enableLock(page, '2580');
    await button(page, 'Desativar').click();
    await typePin(page, '0000');
    await expect(page.getByText('PIN incorreto.')).toBeVisible();
    await typePin(page, '2580');
    await expect(toast(page, 'Bloqueio desativado')).toBeVisible();

    await page.goto('/');
    await expect(page.getByText(/, Ana!/)).toBeVisible();
  });

  test('trocar o PIN', async ({ page }) => {
    await onboard(page);
    await enableLock(page, '2580');
    await button(page, 'Trocar PIN').click();
    await typePin(page, '2580');
    await typePin(page, '9753');
    await button(page, 'Continuar').click();
    await typePin(page, '9753');
    await expect(toast(page, 'Bloqueio ativado')).toBeVisible();

    await page.goto('/');
    await typePin(page, '9753');
    await expect(page.getByText(/, Ana!/)).toBeVisible();
  });

  test('cinco PINs errados seguidos fazem o teclado esperar', async ({ page }) => {
    await onboard(page);
    await enableLock(page, '2580');
    await page.goto('/');
    for (let attempt = 0; attempt < 5; attempt++) await typePin(page, '1111');
    await expect(page.getByText(/Aguarde|tente de novo em/i)).toBeVisible();
  });
});
