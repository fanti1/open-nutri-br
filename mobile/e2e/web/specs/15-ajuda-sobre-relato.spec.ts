import { APP_VERSION } from '../../../src/lib/constants';
import { button, expect, onboard, test, toast } from '../fixtures';

const opened = (page: import('@playwright/test').Page) => page.evaluate(() => window.__opened ?? []);
const copied = (page: import('@playwright/test').Page) => page.evaluate(() => window.__copied ?? []);

test.describe('Central de ajuda', () => {
  test.beforeEach(async ({ page }) => onboard(page));

  test('lista os guias e abre um artigo', async ({ page }) => {
    await page.goto('/ajuda');
    for (const guide of ['Primeiros passos', 'Calculadoras', 'Backup, restauração e bloqueio', 'Acessibilidade', 'Perguntas frequentes']) {
      await expect(page.getByRole('button', { name: new RegExp(`^${guide}\\.`) })).toBeVisible();
    }
    await page.getByRole('button', { name: /^Backup, restauração e bloqueio\./ }).click();
    await expect(page.getByRole('heading', { name: 'Fazer backup' })).toBeVisible();
    await expect(page.getByText('Guarde a senha do backup.', { exact: false })).toBeVisible();
  });

  test('busca sem internet nos guias e nas calculadoras', async ({ page }) => {
    await page.goto('/ajuda');
    await page.getByPlaceholder(/como faço backup/).fill('esqueci o pin');
    await expect(page.getByRole('button', { name: /^Backup, restauração e bloqueio › Esqueci o PIN/ })).toBeVisible();

    await page.getByPlaceholder(/como faço backup/).fill('imc idoso');
    await page.getByRole('button', { name: 'IMC do Idoso', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'IMC do Idoso' })).toBeVisible();
  });

  test('dúvida sem resposta vira sugestão', async ({ page }) => {
    await page.goto('/ajuda');
    await page.getByPlaceholder(/como faço backup/).fill('xilofone');
    await expect(page.getByText('Nada encontrado')).toBeVisible();
    await button(page, 'Enviar a dúvida').click();
    await expect(page.getByRole('tab', { name: 'Sugestão', selected: true })).toBeVisible();
  });
});

test.describe('Relatar um problema', () => {
  test.beforeEach(async ({ page }) => onboard(page));

  test('exige resumo e descrição; abre o GitHub com o modelo de bug preenchido', async ({ page }) => {
    await page.goto('/relatar');
    await button(page, 'Abrir no GitHub').click();
    await expect(page.getByText('Escreva um resumo em uma linha.')).toBeVisible();
    expect(await opened(page)).toEqual([]);

    await page.getByLabel('Resumo em uma linha *').fill('PDF em branco');
    await page.getByLabel('O que aconteceu? *').fill('Ao exportar a ficha, o PDF sai vazio.');
    await page.getByLabel('Passos para reproduzir').fill('1. Abrir a ficha\n2. Exportar PDF');
    await expect(page.getByText(`Versão do app: ${APP_VERSION}`)).toBeVisible();
    await button(page, 'Abrir no GitHub').click();

    const [url] = await opened(page);
    const params = new URL(url).searchParams;
    expect(url).toMatch(/^https:\/\/github\.com\/fanti1\/open-nutri-br\/issues\/new\?/);
    expect(params.get('template')).toBe('bug.yml');
    expect(params.get('title')).toBe('[Problema] PDF em branco');
    expect(params.get('descricao')).toBe('Ao exportar a ficha, o PDF sai vazio.');
    expect(params.get('versao')).toBe(APP_VERSION);
    expect(params.get('diagnostico')).toContain('Sistema: Navegador');
  });

  test('sugestão vai para o modelo de sugestão, sem informações técnicas', async ({ page }) => {
    await page.goto('/relatar?tipo=sugestao');
    await page.getByLabel('Resumo em uma linha *').fill('Exportar plano em planilha');
    await page.getByLabel('O que você sugere e por quê? *').fill('Para enviar à cozinha do hospital.');
    await expect(page.getByText('Informações técnicas que serão incluídas')).toHaveCount(0);
    await button(page, 'Abrir no GitHub').click();
    const params = new URL((await opened(page))[0]).searchParams;
    expect(params.get('template')).toBe('sugestao.yml');
    expect(params.has('diagnostico')).toBe(false);
  });

  test('sem compartilhamento no navegador, o texto do relato é copiado', async ({ page }) => {
    await page.goto('/relatar');
    await page.getByLabel('Resumo em uma linha *').fill('Teste');
    await page.getByLabel('O que aconteceu? *').fill('Descrição do teste.');
    await button(page, 'Copiar ou compartilhar o texto').click();
    await expect(toast(page, 'Texto copiado. Cole onde quiser enviar.')).toBeVisible();
    expect((await copied(page))[0]).toContain('[Problema] Teste');
  });

  test('divergência científica abre o modelo próprio', async ({ page }) => {
    await page.goto('/relatar');
    await page.getByRole('tab', { name: 'Divergência', exact: true }).click();
    await button(page, 'Abrir o modelo de divergência').click();
    expect(new URL((await opened(page))[0]).searchParams.get('template')).toBe('divergencia-cientifica.yml');
  });
});

test.describe('Sobre, Novidades e Licenças', () => {
  test.beforeEach(async ({ page }) => onboard(page));

  test('Sobre mostra a versão e leva ao código-fonte e à licença', async ({ page }) => {
    await page.goto('/sobre');
    await expect(page.getByText(`Versão ${APP_VERSION}`, { exact: true })).toBeVisible();
    await page.getByRole('link', { name: /^Código-fonte no GitHub/ }).click();
    await page.getByRole('link', { name: /^Licença GPL-3\.0/ }).click();
    expect(await opened(page)).toEqual(['https://github.com/fanti1/open-nutri-br', 'https://github.com/fanti1/open-nutri-br/blob/HEAD/LICENSE']);
  });

  test('como citar: a referência ABNT é copiada', async ({ page }) => {
    await page.goto('/sobre');
    await expect(page.getByText(/^OPENNUTRI BR: ferramentas clínicas abertas/)).toBeVisible();
    await button(page, 'Copiar ou compartilhar a referência').click();
    expect((await copied(page))[0]).toMatch(/^OPENNUTRI BR: ferramentas clínicas abertas para nutricionistas\. Versão /);
  });

  test('Novidades mostra a versão atual com o que mudou', async ({ page }) => {
    await page.goto('/novidades');
    await expect(page.getByRole('heading', { name: `Versão ${APP_VERSION}` })).toBeVisible();
    await expect(page.getByText('Esta versão')).toBeVisible();
    await expect(page.getByText('Adicionado', { exact: true })).toBeVisible();
  });

  test('Licenças lista as bibliotecas e busca por nome ou licença', async ({ page }) => {
    await page.goto('/licencas');
    await expect(page.getByText(/bibliotecas, todas compatíveis com a GPL-3\.0/)).toBeVisible();
    await page.getByPlaceholder('Buscar biblioteca ou licença').fill('react-native-svg');
    await page.getByRole('link', { name: /^react-native-svg\./ }).click();
    expect((await opened(page))[0]).toMatch(/^https:\/\//);
  });
});
