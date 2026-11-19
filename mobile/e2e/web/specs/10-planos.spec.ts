import type { Page } from '@playwright/test';
import { answerNextDialog, button, expect, onboard, test, withDemoData, toast } from '../fixtures';

/** Busca na TACO, escolhe o alimento e informa a quantidade. */
async function addFood(page: Page, meal: string, search: string, food: string, grams: string, household?: string): Promise<void> {
  await button(page, `Adicionar alimento: ${meal}`).click();
  await page.getByPlaceholder('Buscar na TACO (ex.: arroz integral)').fill(search);
  await page.getByRole('button', { name: food, exact: true }).click();
  await page.getByLabel('Quantidade').fill(grams);
  if (household) await page.getByLabel('Medida caseira (opcional)').fill(household);
  await button(page, 'Adicionar').click();
}

test.describe('Planos alimentares e recordatório 24 h', () => {
  test('montar um plano: alimentos da TACO, totais, edição, remoção e meta', async ({ page }) => {
    await onboard(page);
    await page.goto('/planos');
    await button(page, 'Plano alimentar').click();
    await expect(page.getByRole('heading', { name: 'Plano alimentar' }).filter({ visible: true })).toBeVisible();

    // Arroz integral cozido: 124 kcal em 100 g (TACO) → 150 g = 186 kcal.
    await addFood(page, 'Almoço', 'arroz integral', 'Arroz, integral, cozido', '150', '5 colheres de sopa');
    await expect(toast(page, 'Arroz adicionado')).toBeVisible();
    await expect(page.getByLabel('186 quilocalorias').first()).toBeVisible();

    // Feijão carioca cozido: 76 kcal em 100 g → 100 g.
    await addFood(page, 'Almoço', 'feijão carioca', 'Feijão, carioca, cozido', '100');
    await expect(page.getByText('Almoço · 262 kcal')).toBeVisible();

    // Editar a quantidade do arroz para 200 g → 248 kcal.
    await page.getByRole('button', { name: 'Arroz, integral, cozido', exact: true }).click();
    await page.getByLabel('Quantidade').fill('200');
    await button(page, 'Salvar').click();
    await expect(page.getByText('Almoço · 324 kcal')).toBeVisible();

    // Remover o feijão.
    await page.getByRole('button', { name: 'Feijão, carioca, cozido', exact: true }).click();
    await button(page, 'Remover').click();
    await expect(page.getByText('Almoço · 248 kcal')).toBeVisible();

    // Meta de energia: o total vira uma fração da meta.
    await page.getByLabel('Meta de energia (kcal/dia)').fill('2000');
    await expect(page.getByText(/meta 2\.000 kcal \(12%\)/)).toBeVisible();

    // Orientações e meta ficam salvas ao sair da tela, mesmo sem esperar o salvamento automático.
    await page.getByLabel('Orientações ao paciente').fill('Beber 2 L de água por dia.');
    await button(page, 'Voltar').click();
    await page.getByRole('button', { name: /^Plano alimentar, .*1 alimento, 248 kcal$/ }).click();
    await expect(page.getByLabel('Orientações ao paciente')).toHaveValue('Beber 2 L de água por dia.');
    await expect(page.getByLabel('Meta de energia (kcal/dia)')).toHaveValue('2000');
  });

  test('plano do paciente: usar o VCT salvo na ficha como meta', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/planos');
    await page.getByRole('button', { name: /^Plano alimentar — outubro, / }).click();
    await expect(page.getByText(/Beatriz Lima/).filter({ visible: true }).first()).toBeVisible();
    await page.getByRole('button', { name: /^Usar o VCT salvo na ficha/ }).click();
    await expect(page.getByLabel('Meta de energia (kcal/dia)')).toHaveValue('2334');
    await expect(page.getByText(/Proteína \d+,\d g\/kg/)).toBeVisible();
  });

  test('duplicar, exportar PDF e excluir pelo menu do plano', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/planos');
    await page.getByRole('button', { name: /^Plano alimentar — outubro, / }).click();

    await button(page, 'Mais opções').click();
    await page.getByRole('button', { name: 'Exportar PDF', exact: true }).last().click();
    await expect.poll(() => page.evaluate(() => window.__printed?.length ?? 0)).toBe(1);
    const printed = await page.evaluate(() => window.__printed![0]);
    // O PDF é o plano (tipo, paciente, alimentos e totais), não a tela do app.
    expect(printed).toContain('<title>Plano alimentar — Beatriz Lima</title>');
    expect(printed).toContain('Arroz, integral, cozido');
    expect(printed).toContain('Ana Souza');
    expect(printed).not.toContain('Adicionar alimento');

    await button(page, 'Mais opções').click();
    await page.getByRole('button', { name: 'Duplicar (ex.: para o retorno)', exact: true }).click();
    await expect(toast(page, 'Plano duplicado')).toBeVisible();

    await button(page, 'Mais opções').click();
    answerNextDialog(page, true);
    await page.getByRole('button', { name: 'Excluir', exact: true }).click();
    await expect(toast(page, 'Excluído')).toBeVisible();

    await page.goto('/planos');
    await expect(page.getByRole('button', { name: /^Plano alimentar — outubro, / })).toHaveCount(1);
  });

  test('recordatório 24 h compara com a necessidade estimada', async ({ page }) => {
    await onboard(page);
    await page.goto('/planos');
    await button(page, 'Recordatório 24 h').click();
    await expect(page.getByRole('heading', { name: 'Recordatório 24 h' }).filter({ visible: true })).toBeVisible();
    await addFood(page, 'Café da manhã', 'banana prata', 'Banana, prata, crua', '100');
    await expect(page.getByText(/Café da manhã · \d+ kcal/)).toBeVisible();
    await expect(page.getByLabel('Necessidade estimada (kcal/dia) — para comparar')).toBeVisible();
  });

  test('sem planos, a lista explica como começar', async ({ page }) => {
    await onboard(page);
    await page.goto('/planos');
    await expect(page.getByText('Nenhum plano ainda')).toBeVisible();
  });
});
