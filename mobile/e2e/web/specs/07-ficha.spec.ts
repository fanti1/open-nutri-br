import type { Page } from '@playwright/test';
import { answerNextDialog, button, expect, openTab, test, withDemoData, toast } from '../fixtures';

async function openBeatriz(page: Page): Promise<void> {
  await withDemoData(page);
  await openTab(page, 'Pacientes');
  await page.getByRole('button', { name: /^Beatriz Lima/ }).click();
  await expect(page.getByRole('heading', { name: 'Beatriz Lima' }).filter({ visible: true })).toBeVisible();
}

test.describe('Ficha do paciente', () => {
  test('resumo: últimas medidas, IMC e evolução em gráfico e em tabela', async ({ page }) => {
    await openBeatriz(page);
    await expect(page.getByText('77,5', { exact: true })).toBeVisible();
    await expect(page.getByText('164', { exact: true })).toBeVisible();
    await expect(page.getByText('28,8', { exact: true })).toBeVisible();

    const chart = page.getByRole('img', { name: /^Gráfico\. Peso: 5 medidas/ });
    await expect(chart).toBeVisible();
    await expect(chart).toHaveAccessibleName(/Primeira 82,4 kg, última 77,5 kg, queda de 4,9 kg\./);

    await button(page, 'Ver como tabela').click();
    await expect(page.getByLabel(/: 82,4 kg$/)).toBeVisible();
    await expect(page.getByLabel(/: 77,5 kg$/)).toBeVisible();
    await button(page, 'Ver como gráfico').click();

    await page.getByRole('tab', { name: 'Cintura', exact: true }).click();
    await expect(page.getByRole('img', { name: /^Gráfico\. Cintura: 5 medidas/ })).toBeVisible();
  });

  test('registrar, editar e excluir um atendimento', async ({ page }) => {
    await openBeatriz(page);
    await button(page, 'Atendimento').click();
    await expect(page.getByRole('heading', { name: 'Novo atendimento' })).toBeVisible();
    await page.getByRole('radio', { name: 'Retorno', exact: true }).click();
    await page.getByRole('textbox', { name: 'Peso', exact: true }).fill('76,2');
    await page.getByLabel('Motivo / queixa principal').fill('Retorno de rotina');
    await button(page, 'Salvar atendimento').click();
    await expect(toast(page, 'Atendimento registrado')).toBeVisible();
    // Salvo, o app abre o atendimento; de volta à ficha, a nova medida passa a ser a última.
    await expect(page.getByRole('heading', { name: 'Atendimento', exact: true })).toBeVisible();
    await button(page, 'Voltar').click();
    await expect(page.getByText('76,2', { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Atendimentos, 6' })).toBeVisible();

    await page.getByRole('tab', { name: 'Atendimentos, 6' }).click();
    await page.getByRole('button', { name: /^Retorno em .*Retorno de rotina$/ }).click();
    await page.getByLabel('Evolução e observações').fill('Boa adesão ao plano.');
    await button(page, 'Salvar atendimento').click();
    await expect(toast(page, 'Atendimento atualizado')).toBeVisible();

    answerNextDialog(page, true);
    await button(page, 'Excluir atendimento').click();
    await expect(toast(page, 'Atendimento excluído')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Atendimentos, 5' })).toBeVisible();
  });

  test('cálculos salvos aparecem na ficha e podem ser excluídos', async ({ page }) => {
    await openBeatriz(page);
    await page.getByRole('tab', { name: 'Cálculos, 3' }).click();
    for (const name of ['IMC', 'Mifflin-St Jeor', 'Valor Calórico Total']) {
      await expect(page.getByText(name, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    }
    answerNextDialog(page, true);
    await button(page, 'Excluir cálculo: Mifflin-St Jeor').click();
    await expect(page.getByRole('tab', { name: 'Cálculos, 2' })).toBeVisible();
  });

  test('calcular pela ficha usa a idade, o sexo e as medidas do paciente', async ({ page }) => {
    await openBeatriz(page);
    await button(page, 'Calcular').first().click();
    await page.getByRole('radio', { name: /^Consultório/ }).click();
    await page.getByRole('button', { name: 'Mifflin-St Jeor', exact: true }).click();
    await expect(page.getByText('Idade, sexo e últimas medidas vêm da ficha')).toBeVisible();
    await expect(page.getByLabel('Peso (kg) *', { exact: true })).toHaveValue('77,5');
    await expect(page.getByLabel('Estatura (cm) *', { exact: true })).toHaveValue('164');
    await expect(page.getByLabel(/^Resultado: /).first()).toBeVisible();
  });

  test('anexar e excluir um arquivo', async ({ page }) => {
    await openBeatriz(page);
    await page.getByRole('tab', { name: /^Arquivos/ }).click();
    await expect(page.getByText('Nenhum arquivo')).toBeVisible();
    const chooser = page.waitForEvent('filechooser');
    await button(page, 'Anexar arquivo').first().click();
    await (await chooser).setFiles({ name: 'hemograma.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 exame fictício') });
    await expect(toast(page, 'Arquivo anexado')).toBeVisible();
    await expect(page.getByText('hemograma.pdf')).toBeVisible();

    answerNextDialog(page, true);
    await button(page, 'Excluir arquivo: hemograma.pdf').click();
    await expect(page.getByText('Nenhum arquivo')).toBeVisible();
  });

  test('dieta: os planos do paciente aparecem e um novo já sai vinculado', async ({ page }) => {
    await openBeatriz(page);
    await page.getByRole('tab', { name: 'Dieta, 1' }).click();
    await expect(page.getByRole('button', { name: /^Plano alimentar — outubro, / })).toBeVisible();
    await button(page, 'Recordatório 24 h').click();
    await expect(page.getByRole('heading', { name: 'Recordatório 24 h' })).toBeVisible();
    await expect(page.getByText(/Beatriz Lima/).filter({ visible: true }).first()).toBeVisible();
  });

  test('agendar pela ficha já escolhe o paciente', async ({ page }) => {
    await openBeatriz(page);
    await button(page, 'Agendar').first().click();
    await expect(page.getByRole('heading', { name: 'Novo compromisso' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Beatriz Lima/ })).toBeVisible();
  });
});
