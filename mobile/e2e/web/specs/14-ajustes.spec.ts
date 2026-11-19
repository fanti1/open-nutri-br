import { button, expect, onboard, openTab, test, toast } from '../fixtures';

test.describe('Mais: perfil, aparência, referências e privacidade', () => {
  test('editar o perfil profissional muda a saudação', async ({ page }) => {
    await onboard(page);
    await page.goto('/perfil');
    await page.getByLabel('Nome', { exact: true }).fill('Dra. Júlia Ramos');
    await page.getByLabel('UF').fill('mg');
    await button(page, 'Salvar').click();
    await expect(toast(page, 'Perfil atualizado')).toBeVisible();
    await page.goto('/');
    await expect(page.getByText(/, Dra\.!/)).toBeVisible();
    await page.goto('/perfil');
    await expect(page.getByLabel('UF')).toHaveValue('MG');
  });

  test('aparência: escuro e claro mudam o fundo e ficam salvos', async ({ page }) => {
    await onboard(page);
    await openTab(page, 'Mais');
    // Cor de fundo do que está no meio da tela (sobe até o primeiro elemento com fundo próprio).
    const background = () =>
      page.evaluate(() => {
        let element: Element | null = document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 150);
        while (element) {
          const color = getComputedStyle(element).backgroundColor;
          if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' && !element.closest('[role="button"]')) return color;
          element = element.parentElement;
        }
        return null;
      });

    await page.getByRole('tab', { name: 'Escuro', exact: true }).click();
    await expect.poll(background).toBe('rgb(9, 20, 20)');
    await page.reload();
    await expect.poll(background).toBe('rgb(9, 20, 20)');

    await page.getByRole('tab', { name: 'Claro', exact: true }).click();
    await expect.poll(background).toBe('rgb(241, 247, 246)');
  });

  test('o menu Mais abre cada seção', async ({ page }) => {
    await onboard(page);
    const sections: [RegExp, string][] = [
      [/^Tarefas\./, 'Tarefas'],
      [/^Planos alimentares\./, 'Planos alimentares'],
      [/^Tabela Nutricional\./, 'Tabela Nutricional'],
      [/^Referências e auditoria\./, 'Referências e auditoria'],
      [/^Backup e restauração\./, 'Backup'],
      [/^Segurança\./, 'Segurança'],
      [/^Privacidade e LGPD\./, 'Privacidade e LGPD'],
      [/^Perfil profissional\./, 'Perfil profissional'],
      [/^Central de ajuda\./, 'Central de ajuda'],
      [/^Relatar um problema\./, 'Relatar um problema'],
      [/^Sobre o OpenNutri BR\./, 'Sobre'],
    ];
    for (const [item, heading] of sections) {
      await page.goto('/mais');
      await page.getByRole('button', { name: item }).click();
      await expect(page.getByRole('heading', { name: heading, exact: true }).filter({ visible: true })).toBeVisible();
    }
  });

  test('referências e auditoria: panorama dos 55 métodos', async ({ page }) => {
    await onboard(page);
    await page.goto('/referencias');
    for (const [status, count] of [
      ['Conferido na fonte', '31'],
      ['Conferido, com ressalvas', '19'],
      ['Conferência pendente', '5'],
      ['Divergência encontrada', '0'],
    ]) {
      await expect(page.getByText(status, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(count, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByText('IMC do Idoso', { exact: true })).toBeVisible();
  });

  test('privacidade e LGPD explica onde ficam os dados e o relato de problemas', async ({ page }) => {
    await onboard(page);
    await page.goto('/privacidade');
    await expect(page.getByRole('heading', { name: 'Seus direitos e responsabilidades' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Relatos de problema' })).toBeVisible();
  });
});
