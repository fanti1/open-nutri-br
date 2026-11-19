import { button, expect, onboard, test } from '../fixtures';

test.describe('Tabela Nutricional (TACO)', () => {
  test.beforeEach(async ({ page }) => {
    await onboard(page);
    await page.goto('/alimentos');
  });

  test('os 597 alimentos em 15 grupos; um grupo filtra a lista', async ({ page }) => {
    await expect(page.getByText('597 alimentos em 15 grupos')).toBeVisible();
    await button(page, 'Frutas e derivados, 96 alimentos').click();
    await expect(page.getByRole('button', { name: 'Remover filtro: Frutas e derivados' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Banana, prata, crua/ })).toBeVisible();
    await button(page, 'Remover filtro: Frutas e derivados').click();
    await expect(page.getByText('597 alimentos em 15 grupos')).toBeVisible();
  });

  test('busca e detalhe do alimento com os valores da tabela oficial', async ({ page }) => {
    await page.getByPlaceholder('Buscar alimento (ex.: feijão cozido)').fill('feijao carioca cozido');
    await page.getByRole('button', { name: /^Feijão, carioca, cozido/ }).click();
    await expect(page.getByRole('heading', { name: 'Feijão, carioca, cozido' }).filter({ visible: true })).toBeVisible();
    // Conferido na tabela impressa: 76 kcal e 8,5 g de fibra em 100 g.
    await expect(page.getByText('76', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('8,5', { exact: true }).first()).toBeVisible();
  });

  test('busca sem resultado', async ({ page }) => {
    await page.getByPlaceholder('Buscar alimento (ex.: feijão cozido)').fill('xilofone');
    await expect(page.getByText('Nenhum alimento encontrado')).toBeVisible();
  });
});
