import { button, expect, onboard, openTab, test } from '../fixtures';

test.describe('Aba Calculadoras', () => {
  test.beforeEach(async ({ page }) => {
    await onboard(page);
    await openTab(page, 'Calculadoras');
  });

  test('o público escolhido filtra os métodos e fica lembrado', async ({ page }) => {
    await expect(page.getByText('42 métodos validados para adultos (20 a 59 anos).')).toBeVisible();
    await page.getByRole('radio', { name: /^Idoso/ }).click();
    await expect(page.getByText(/métodos validados para idosos \(60 anos ou mais\)\./)).toBeVisible();
    await expect(page.getByRole('radio', { name: /^Idoso/ })).toBeChecked();

    await page.reload();
    await expect(page.getByRole('radio', { name: /^Idoso/ })).toBeChecked();
  });

  test('criança mostra a área Pediatria; adulto não', async ({ page }) => {
    await expect(page.getByRole('radio', { name: /^Pediatria/ })).toHaveCount(0);
    await page.getByRole('radio', { name: /^Criança/ }).click();
    await expect(page.getByRole('radio', { name: /^Pediatria/ })).toBeVisible();
  });

  test('escolher uma área mostra os métodos por tema; tocar de novo fecha', async ({ page }) => {
    await expect(page.getByText('Escolha uma área para ver os métodos.')).toBeVisible();
    await page.getByRole('radio', { name: /^Hospitalar e Terapia Intensiva/ }).click();
    await expect(page.getByRole('heading', { name: 'Hospitalar e Terapia Intensiva' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'NRS-2002', exact: true })).toBeVisible();
    await page.getByRole('radio', { name: /^Hospitalar e Terapia Intensiva/ }).click();
    await expect(page.getByText('Escolha uma área para ver os métodos.')).toBeVisible();
  });

  test('abrir um método pela área já leva o público escolhido para a calculadora', async ({ page }) => {
    await page.getByRole('radio', { name: /^Idoso/ }).click();
    await page.getByRole('radio', { name: /^Consultório/ }).click();
    await page.getByRole('button', { name: 'IMC do Idoso', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'IMC do Idoso' })).toBeVisible();
    // Só falta o sexo: a faixa veio da aba.
    await expect(page.getByText('Escolha o sexo para começar. Fica salvo para esta calculadora.')).toBeVisible();
  });

  test('a busca procura em todos os públicos, por nome e sigla', async ({ page }) => {
    await page.getByPlaceholder('Buscar método (ex.: IMC, GLIM, OMS)').fill('glim');
    await expect(page.getByText('1 resultado em todos os públicos')).toBeVisible();
    await page.getByRole('button', { name: 'GLIM', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'GLIM' })).toBeVisible();
  });

  test('busca sem resultado explica e limpar volta à lista', async ({ page }) => {
    const search = page.getByPlaceholder('Buscar método (ex.: IMC, GLIM, OMS)');
    await search.fill('xilofone');
    await expect(page.getByText('Nada encontrado')).toBeVisible();
    await button(page, 'Limpar').click();
    await expect(page.getByText('Para quem é o cálculo?')).toBeVisible();
  });

  test('favoritar pela estrela da lista e desfazer', async ({ page }) => {
    await page.getByRole('radio', { name: /^Consultório/ }).click();
    await button(page, 'Adicionar Cunningham aos favoritos').click();
    await expect(page.getByRole('heading', { name: 'Favoritas' })).toBeVisible();
    await button(page, 'Remover Cunningham dos favoritos').first().click();
    await expect(page.getByRole('heading', { name: 'Favoritas' })).toHaveCount(0);
  });
});
