import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DEMO_BACKUP, expect, test, withDemoData } from '../fixtures';

/**
 * Toda rota do app abre sem erro, nos temas claro e escuro, com dados (a fixture
 * falha em qualquer erro de JavaScript, de console ou requisição externa). A lista
 * sai da pasta app/: uma tela nova entra no teste sozinha. Rotas com [parâmetro]
 * usam os ids do backup fictício.
 */
function routes(dir: string, base = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return routes(path, base);
    if (!name.endsWith('.tsx') || name.startsWith('_') || name.startsWith('+')) return [];
    // app/(tabs)/index.tsx → "/", app/ajuda/index.tsx → "/ajuda", app/(tabs)/mais.tsx → "/mais".
    const segments = relative(base, path)
      .replace(/\\/g, '/')
      .replace(/\.tsx$/, '')
      .split('/')
      .filter((segment) => !/^\(.+\)$/.test(segment));
    if (segments[segments.length - 1] === 'index') segments.pop();
    return ['/' + segments.join('/')];
  });
}

const ALL = routes(join(__dirname, '../../../app'));

const demo = JSON.parse(readFileSync(DEMO_BACKUP, 'utf8')).data;
const beatriz = demo.patients.find((patient: { name: string }) => patient.name === 'Beatriz Lima').id;

/** Exemplo concreto de cada rota com parâmetro. */
const URLS: Record<string, string> = {
  '/calculadora/[slug]': '/calculadora/imc',
  '/paciente/[id]': `/paciente/${beatriz}`,
  '/paciente/editar/[id]': `/paciente/editar/${beatriz}`,
  '/paciente/calcular/[id]': `/paciente/calcular/${beatriz}`,
  '/plano/[id]': `/plano/${demo.meal_plans[0].id}`,
  '/atendimento/[id]': `/atendimento/${demo.consultations[0].id}`,
  '/atendimento/novo': `/atendimento/novo?patientId=${beatriz}`,
  '/tarefa/[id]': `/tarefa/${demo.tasks[0].id}`,
  '/compromisso/[id]': `/compromisso/${demo.appointments[0].id}`,
  '/alimentos/[id]': '/alimentos/1',
  '/ajuda/[slug]': '/ajuda/primeiros-passos',
};

test('a lista de rotas cobre as telas conhecidas e toda rota com parâmetro tem exemplo', () => {
  expect(ALL).toEqual(expect.arrayContaining(['/', '/calculadoras', '/pacientes', '/agenda', '/mais', '/calculadora/[slug]', '/paciente/[id]', '/plano/[id]', '/sobre']));
  expect(ALL.length).toBeGreaterThanOrEqual(30);
  expect(ALL.filter((route) => route.includes('[') && !URLS[route])).toEqual([]);
});

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`Toda tela abre sem erro (tema ${scheme === 'light' ? 'claro' : 'escuro'})`, () => {
    test.use({ colorScheme: scheme });

    for (const route of ALL.filter((path) => path !== '/onboarding')) {
      const url = URLS[route] ?? route;
      test(url, async ({ page }) => {
        await withDemoData(page);
        // Nenhuma tela deve abrir um diálogo sozinha.
        page.on('dialog', (dialog) => {
          throw new Error(`diálogo inesperado em ${url}: ${dialog.message()}`);
        });
        await page.goto(url);
        await expect(page.getByRole('heading').first()).toBeVisible();
        await expect(page.getByText('Algo deu errado')).toHaveCount(0);
      });
    }
  });
}
