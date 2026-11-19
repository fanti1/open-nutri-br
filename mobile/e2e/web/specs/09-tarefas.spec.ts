import { answerNextDialog, brDate, button, expect, onboard, pickDate, test, withDemoData, toast } from '../fixtures';

test.describe('Tarefas', () => {
  test('tarefa rápida pelo Enter', async ({ page }) => {
    await onboard(page);
    await page.goto('/tarefas');
    const quick = page.getByPlaceholder('Adicionar tarefa rápida e tecle Enter');
    await quick.fill('Ligar para o laboratório');
    await quick.press('Enter');
    await expect(toast(page, 'Tarefa adicionada')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Ligar para o laboratório, pendente/ })).toBeVisible();
  });

  test('nova tarefa com prazo; concluir, filtrar, reabrir, editar e excluir', async ({ page }) => {
    await onboard(page);
    await page.goto('/tarefa/novo');
    await button(page, 'Adicionar tarefa').click();
    await expect(page.getByText('Descreva a tarefa.')).toBeVisible();

    await page.getByLabel('Tarefa *').fill('Revisar plano da Marina');
    await pickDate(page, 'Prazo', brDate(1), { hour: '18', minute: '00' });
    await page.getByLabel('Detalhes').fill('Ajustar lanche da tarde');
    await button(page, 'Adicionar tarefa').click();
    await expect(toast(page, 'Tarefa adicionada')).toBeVisible();

    await page.goto('/tarefas');
    await expect(page.getByRole('button', { name: /^Revisar plano da Marina, pendente, Prazo amanhã/i })).toBeVisible();

    // Concluir pela caixa: sai de Pendentes e aparece em Concluídas.
    await page.getByRole('checkbox', { name: 'Revisar plano da Marina' }).click();
    await expect(page.getByRole('button', { name: /^Revisar plano da Marina/ })).toHaveCount(0);
    await page.getByRole('tab', { name: 'Concluídas', exact: true }).click();
    await expect(page.getByRole('button', { name: /^Revisar plano da Marina, concluída/ })).toBeVisible();

    await page.getByRole('button', { name: /^Revisar plano da Marina/ }).click();
    await button(page, 'Reabrir tarefa').click();
    await expect(toast(page, 'Tarefa reaberta')).toBeVisible();
    await page.getByLabel('Tarefa *').fill('Revisar plano da Marina (v2)');
    await button(page, 'Salvar alterações').click();
    await expect(toast(page, 'Tarefa atualizada')).toBeVisible();

    await page.goto('/tarefas');
    await page.getByRole('tab', { name: 'Todas', exact: true }).click();
    await page.getByRole('button', { name: /^Revisar plano da Marina \(v2\)/ }).click();
    answerNextDialog(page, true);
    await button(page, 'Excluir tarefa').click();
    await expect(toast(page, 'Tarefa excluída')).toBeVisible();
  });

  test('tarefa com prazo vencido aparece como atrasada', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/tarefas');
    await expect(page.getByRole('button', { name: /^Enviar plano alimentar da Beatriz, pendente, Atrasada/ })).toBeVisible();
  });

  test('o menu Mais mostra quantas tarefas estão abertas', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/mais');
    await expect(page.getByRole('button', { name: /^Tarefas\. Checklist/ })).toBeVisible();
    await expect(page.getByText('1', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  });
});
