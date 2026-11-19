import { button, expect, onboard, test } from '../fixtures';

test.describe('Primeiro acesso', () => {
  test('boas-vindas, perfil e aceite da privacidade levam ao Início com a saudação', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Bem-vindo(a) ao OpenNutri BR')).toBeVisible();
    await expect(page.getByText('55 calculadoras científicas')).toBeVisible();

    await page.getByText('Começar', { exact: true }).click();
    await page.getByLabel('Como quer ser chamado(a)?').fill('Bruna Teixeira');
    await page.getByLabel('CRN').fill('12345');
    await page.getByLabel('UF').fill('rj');
    await page.getByLabel('Especialidade').fill('Nutrição clínica');
    await page.getByText('Continuar', { exact: true }).click();

    // Sem o aceite, não dá para entrar.
    await expect(button(page, 'Aceitar e entrar')).toBeDisabled();
    await page.getByText('Li e concordo com a política de privacidade.').click();
    await button(page, 'Aceitar e entrar').click();

    await expect(page.getByText(/, Bruna!/)).toBeVisible();

    // O perfil ficou salvo (UF em maiúsculas).
    await page.goto('/perfil');
    await expect(page.getByLabel('Nome')).toHaveValue('Bruna Teixeira');
    await expect(page.getByLabel('CRN')).toHaveValue('12345');
    await expect(page.getByLabel('UF')).toHaveValue('RJ');
  });

  test('voltar entre os passos mantém o que foi digitado', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Começar', { exact: true }).click();
    await page.getByLabel('Como quer ser chamado(a)?').fill('Ana');
    await page.getByText('Continuar', { exact: true }).click();
    await button(page, 'Voltar').click();
    await expect(page.getByLabel('Como quer ser chamado(a)?')).toHaveValue('Ana');
  });

  test('depois de concluído, o primeiro acesso não aparece de novo', async ({ page }) => {
    await onboard(page);
    await page.goto('/');
    await expect(page.getByText(/, Ana!/)).toBeVisible();
    await page.goto('/onboarding');
    await expect(page.getByText(/, Ana!/)).toBeVisible();
  });

  test('o registro do aceite aparece em Privacidade e LGPD', async ({ page }) => {
    await onboard(page);
    await page.goto('/privacidade');
    await expect(page.getByText('Termos de privacidade aceitos (versão 1.0).')).toBeVisible();
  });
});
