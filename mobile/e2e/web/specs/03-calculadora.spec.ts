import { button, expect, onboard, test, withDemoData } from '../fixtures';

test.describe('Tela da calculadora', () => {
  test('o perfil escolhido na primeira vez fica salvo para a próxima', async ({ page }) => {
    await onboard(page);
    await page.goto('/calculadora/mifflin-st-jeor');
    await expect(page.getByText('Escolha a faixa etária e o sexo para começar. Fica salvo para esta calculadora.')).toBeVisible();
    await page.getByRole('tab', { name: 'Idoso', exact: true }).click();
    await page.getByRole('tab', { name: 'Masculino', exact: true }).click();
    await expect(page.getByText('Perfil salvo para esta calculadora')).toBeVisible();

    await page.goto('/calculadora/mifflin-st-jeor');
    await expect(page.getByText('Idoso · Masculino')).toBeVisible();
    await expect(page.getByText('Perfil salvo para esta calculadora')).toBeVisible();

    // Alterar o perfil e cancelar mantém o salvo; salvar troca.
    await button(page, 'Alterar').click();
    await page.getByRole('tab', { name: 'Adulto', exact: true }).click();
    await button(page, 'Cancelar').click();
    await expect(page.getByText('Idoso · Masculino')).toBeVisible();
    await button(page, 'Alterar').click();
    await page.getByRole('tab', { name: 'Feminino', exact: true }).click();
    await button(page, 'Salvar perfil').click();
    await expect(page.getByText('Idoso · Feminino')).toBeVisible();
  });

  test('valor fora da faixa pede correção em vez de calcular', async ({ page }) => {
    await onboard(page);
    await page.goto('/calculadora/imc?faixa=adulto');
    await page.getByRole('tab', { name: 'Feminino', exact: true }).click();
    await page.getByLabel('Peso (kg) *', { exact: true }).fill('70');
    await page.getByLabel('Altura (m) *', { exact: true }).fill('165');
    await expect(page.getByText('Corrija os campos destacados em vermelho.')).toBeVisible();
    await expect(button(page, 'Salvar no histórico')).toHaveCount(0);

    await page.getByLabel('Altura (m) *', { exact: true }).fill('1,65');
    await expect(page.getByLabel('Resultado: 25,71', { exact: true })).toBeVisible();
    await expect(page.getByText('Sobrepeso', { exact: true }).first()).toBeVisible();
  });

  test('enquanto falta dado, a barra diz o que falta', async ({ page }) => {
    await onboard(page);
    await page.goto('/calculadora/imc?faixa=adulto');
    await page.getByRole('tab', { name: 'Feminino', exact: true }).click();
    await expect(page.getByText('0 de 2 obrigatórios')).toBeVisible();
    await page.getByLabel('Peso (kg) *', { exact: true }).fill('70');
    await expect(page.getByText('1 de 2 obrigatórios')).toBeVisible();
    await expect(page.getByText(/Falta preencher/)).toBeVisible();
  });

  test('salvar no histórico sem paciente', async ({ page }) => {
    await onboard(page);
    await page.goto('/calculadora/imc?faixa=adulto');
    await page.getByRole('tab', { name: 'Feminino', exact: true }).click();
    await page.getByLabel('Peso (kg) *', { exact: true }).fill('64');
    await page.getByLabel('Altura (m) *', { exact: true }).fill('1,6');
    await button(page, 'Salvar no histórico').click();
    await expect(button(page, 'Cálculo salvo')).toBeDisabled();
  });

  test('calcular para um paciente: idade, sexo e medidas vêm da ficha e o cálculo vai para a ficha', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/calculadora/imc');
    await button(page, 'Calcular para um paciente cadastrado').click();
    await page.getByRole('button', { name: /^Beatriz Lima/ }).click();

    await expect(page.getByText('Idade, sexo e últimas medidas vêm da ficha')).toBeVisible();
    await expect(page.getByLabel('Peso (kg) *', { exact: true })).toHaveValue('77,5');
    await expect(page.getByLabel('Altura (m) *', { exact: true })).toHaveValue('1,64');
    await expect(page.getByLabel('Resultado: 28,81', { exact: true })).toBeVisible();

    await button(page, 'Salvar na ficha do paciente').click();
    await button(page, 'Ver na ficha do paciente').click();
    await page.getByRole('tab', { name: /^Cálculos/ }).click();
    await expect(page.getByText('IMC', { exact: true }).filter({ visible: true }).first()).toBeVisible();
    // A demonstração já tinha 3 cálculos; agora são 4.
    await expect(page.getByRole('tab', { name: 'Cálculos, 4' })).toBeVisible();
  });

  test('paciente fora da faixa validada do método recebe aviso', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/calculadora/imc');
    await button(page, 'Calcular para um paciente cadastrado').click();
    await page.getByRole('button', { name: /^Lucas Andrade/ }).click();
    await expect(page.getByText('Método fora da faixa do paciente')).toBeVisible();
  });

  test('favoritar pelo cabeçalho coloca a calculadora em Favoritas', async ({ page }) => {
    await onboard(page);
    await page.goto('/calculadora/homa-ir');
    await button(page, 'Adicionar aos favoritos').click();
    await expect(button(page, 'Remover dos favoritos')).toBeVisible();
    await page.goto('/calculadoras');
    await expect(page.getByRole('heading', { name: 'Favoritas' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'HOMA-IR', exact: true })).toBeVisible();
  });

  test('sobre o método: fórmula, fontes, exemplo resolvido e link para a fonte', async ({ page }) => {
    await onboard(page);
    await page.goto('/calculadora/imc');
    await page.getByRole('button', { name: 'Sobre o método e referência' }).click();
    await expect(page.getByText('Exemplo resolvido')).toBeVisible();
    await expect(page.getByText('Fontes conferidas')).toBeVisible();
    await page.getByRole('link', { name: 'Abrir a fonte' }).first().click();
    await expect.poll(() => page.evaluate(() => window.__opened ?? [])).toEqual([expect.stringMatching(/^https?:\/\//)]);
  });

  test('método com conferência pendente avisa antes do formulário', async ({ page }) => {
    await onboard(page);
    await page.goto('/calculadora/gomez');
    await expect(page.getByText('Conferência pendente').first()).toBeVisible();
    await expect(page.getByText('Ver a auditoria do método')).toBeVisible();
  });
});
