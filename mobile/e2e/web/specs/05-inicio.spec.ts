import { button, expect, onboard, pickDate, test, withDemoData, toast } from '../fixtures';

test.describe('Início', () => {
  test('com dados: tarefas, pacientes recentes, calculadoras favoritas e áreas', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/');
    await expect(page.getByText(/, Ana!/)).toBeVisible();
    await expect(page.getByRole('button', { name: /^Hoje: .* e 1 tarefa pendente\./ })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Tarefas pendentes' })).toBeVisible();
    await expect(page.getByText('Enviar plano alimentar da Beatriz')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Suas calculadoras' })).toBeVisible();
    for (const name of ['IMC', 'Mifflin-St Jeor', 'Valor Calórico Total']) {
      await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
    }

    // Recentes: as três últimas fichas cadastradas, a mais nova primeiro.
    await expect(page.getByRole('heading', { name: 'Pacientes recentes' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Beatriz Lima/ })).toHaveCount(0);
    await page.getByRole('button', { name: /^Joaquim Pereira/ }).click();
    await expect(page.getByRole('heading', { name: 'Joaquim Pereira' })).toBeVisible();
  });

  test('o cartão do dia abre a Agenda', async ({ page }) => {
    await onboard(page);
    await page.getByRole('button', { name: /^Hoje: / }).click();
    await expect(page.getByRole('heading', { name: 'Agenda' })).toBeVisible();
  });

  test('atalhos levam a novo paciente, novo compromisso e nova tarefa', async ({ page }) => {
    await onboard(page);
    for (const [shortcut, heading] of [
      ['Novo paciente', 'Novo paciente'],
      ['Agendar', 'Novo compromisso'],
      ['Nova tarefa', 'Nova tarefa'],
    ]) {
      await page.goto('/');
      await button(page, shortcut).click();
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    }
  });

  test('um bloco de área abre a aba Calculadoras com a área escolhida', async ({ page }) => {
    await onboard(page);
    await page.getByRole('button', { name: /^Exames laboratoriais/ }).click();
    await expect(page.getByRole('radio', { name: /^Exames laboratoriais/ })).toBeChecked();
    await expect(page.getByRole('button', { name: 'HOMA-IR', exact: true })).toBeVisible();
  });

  test('o avatar abre o perfil profissional', async ({ page }) => {
    await onboard(page);
    await button(page, 'Perfil profissional').click();
    await expect(page.getByRole('heading', { name: 'Perfil profissional' })).toBeVisible();
  });

  test('com pacientes e sem backup recente, o Início lembra de fazer backup', async ({ page }) => {
    await onboard(page);
    await page.goto('/paciente/novo');
    await page.getByLabel('Nome completo *').fill('Paciente Teste');
    await pickDate(page, 'Data de nascimento', '10/03/1985');
    await page.getByRole('radio', { name: 'Feminino', exact: true }).click();
    await button(page, 'Criar ficha').click();
    await expect(toast(page, 'Ficha criada')).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: /^Faça seu primeiro backup/ }).click();
    await expect(page.getByRole('heading', { name: 'Backup', exact: true })).toBeVisible();
  });

  test('sem pacientes, o Início não cobra backup', async ({ page }) => {
    await onboard(page);
    await expect(page.getByText(/Faça seu primeiro backup/)).toHaveCount(0);
  });
});
