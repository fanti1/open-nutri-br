import type { Page } from '@playwright/test';
import { answerNextDialog, button, expect, onboard, openTab, pickDate, test, withDemoData, toast } from '../fixtures';

async function createPatient(page: Page, name: string, birth: string, sex: 'Feminino' | 'Masculino'): Promise<void> {
  await page.goto('/paciente/novo');
  await page.getByLabel('Nome completo *').fill(name);
  await pickDate(page, 'Data de nascimento', birth);
  await page.getByRole('radio', { name: sex, exact: true }).click();
  await button(page, 'Criar ficha').click();
  await expect(toast(page, 'Ficha criada')).toBeVisible();
}

test.describe('Pacientes', () => {
  test('sem fichas, o estado vazio leva a criar a primeira', async ({ page }) => {
    await onboard(page);
    await openTab(page, 'Pacientes');
    await expect(page.getByText('Nenhum paciente ainda')).toBeVisible();
    await button(page, 'Novo paciente').click();
    await expect(page.getByRole('heading', { name: 'Novo paciente', exact: true })).toBeVisible();
  });

  test('criar ficha: campos obrigatórios são cobrados e a ficha abre com os dados', async ({ page }) => {
    await onboard(page);
    await page.goto('/paciente/novo');
    await button(page, 'Criar ficha').click();
    await expect(page.getByText('Informe o nome.')).toBeVisible();
    await expect(page.getByText('Informe a data de nascimento.')).toBeVisible();
    await expect(page.getByText('Selecione o sexo.')).toBeVisible();

    await page.getByLabel('Nome completo *').fill('Marina Alves');
    await pickDate(page, 'Data de nascimento', '25/03/1992');
    await page.getByRole('radio', { name: 'Feminino', exact: true }).click();
    await page.getByLabel('Telefone').fill('(11) 98888-7777');
    await page.getByLabel('E-mail').fill('marina@exemplo.com');
    await page.getByLabel('Observações / anamnese resumida').fill('Paciente fictícia de teste.');
    await button(page, 'Criar ficha').click();

    await expect(toast(page, 'Ficha criada')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Marina Alves' }).filter({ visible: true })).toBeVisible();
    await expect(page.getByText(/Adulto · \d+ anos · Feminino · nasc\. 25\/03\/1992/)).toBeVisible();
    await expect(page.getByText('(11) 98888-7777')).toBeVisible();
    await expect(page.getByText('marina@exemplo.com')).toBeVisible();
  });

  test('data de nascimento no futuro não é aceita', async ({ page }) => {
    await onboard(page);
    await page.goto('/paciente/novo');
    await page.getByLabel('Nome completo *').fill('Teste Futuro');
    await pickDate(page, 'Data de nascimento', '01/01/2099');
    await page.getByRole('radio', { name: 'Masculino', exact: true }).click();
    await button(page, 'Criar ficha').click();
    await expect(page.getByText('A data não pode ser no futuro.')).toBeVisible();
  });

  test('lista: contagem, faixa etária e busca pelo nome', async ({ page }) => {
    await withDemoData(page);
    await openTab(page, 'Pacientes');
    await expect(page.getByText('5 fichas')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Lucas Andrade, \d+ anos · Masculino/ })).toBeVisible();

    await page.getByPlaceholder('Buscar pelo nome').fill('hele');
    await expect(page.getByRole('button', { name: /^Helena Duarte/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Beatriz Lima/ })).toHaveCount(0);

    await page.getByPlaceholder('Buscar pelo nome').fill('zzz');
    await expect(page.getByText('Nenhum paciente encontrado')).toBeVisible();
  });

  test('editar a ficha', async ({ page }) => {
    await onboard(page);
    await createPatient(page, 'Carlos Souza', '02/02/1970', 'Masculino');
    await button(page, 'Mais opções').click();
    await page.getByRole('button', { name: 'Editar dados', exact: true }).click();
    await page.getByLabel('Nome completo *').fill('Carlos Souza Filho');
    await button(page, 'Salvar alterações').click();
    await expect(toast(page, 'Ficha atualizada')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Carlos Souza Filho' }).filter({ visible: true })).toBeVisible();
    // O menu "Mais opções" não pode ficar preso aberto (nem o fundo escuro dele) depois de navegar.
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('excluir a ficha pede confirmação e apaga', async ({ page }) => {
    await onboard(page);
    await createPatient(page, 'Para Excluir', '02/02/1970', 'Masculino');

    const fichaUrl = page.url();
    await button(page, 'Mais opções').click();
    answerNextDialog(page, false);
    await page.getByRole('button', { name: 'Excluir paciente', exact: true }).click();
    // Cancelado: a ficha continua existindo.
    await openTab(page, 'Pacientes');
    await expect(page.getByRole('button', { name: /^Para Excluir/ })).toBeVisible();

    await page.goto(fichaUrl);
    await button(page, 'Mais opções').click();
    answerNextDialog(page, true);
    await page.getByRole('button', { name: 'Excluir paciente', exact: true }).click();
    await expect(toast(page, 'Ficha excluída')).toBeVisible();
    await openTab(page, 'Pacientes');
    await expect(page.getByText('Nenhum paciente ainda')).toBeVisible();
  });

  test('exportar a ficha em PDF imprime o relatório do paciente, não a tela', async ({ page }) => {
    await withDemoData(page);
    await openTab(page, 'Pacientes');
    await page.getByRole('button', { name: /^Beatriz Lima/ }).click();
    await button(page, 'Mais opções').click();
    await page.getByRole('button', { name: 'Exportar ficha em PDF', exact: true }).click();

    await expect.poll(() => page.evaluate(() => window.__printed?.length ?? 0)).toBe(1);
    const printed = await page.evaluate(() => window.__printed![0]);
    expect(printed).toContain('Beatriz Lima');
    expect(printed).toContain('Ana Souza'); // profissional responsável
    expect(printed).toMatch(/77,5/); // última medida
    expect(printed).not.toContain('Calculadoras'); // não é a tela do app
  });
});
