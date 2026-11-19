import { answerNextDialog, brDate, button, expect, onboard, openTab, pickDate, test, withDemoData, toast } from '../fixtures';

const MONTH = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

test.describe('Agenda', () => {
  test('o calendário navega entre os meses', async ({ page }) => {
    await onboard(page);
    await openTab(page, 'Agenda');
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await expect(page.getByText(capitalized(MONTH.format(now)))).toBeVisible();
    await button(page, 'Próximo mês').click();
    await expect(page.getByText(capitalized(MONTH.format(next)))).toBeVisible();
    await button(page, 'Mês anterior').click();
    await expect(page.getByText(capitalized(MONTH.format(now)))).toBeVisible();
  });

  test('dia sem compromisso oferece agendar nele', async ({ page }) => {
    await onboard(page);
    await openTab(page, 'Agenda');
    await expect(page.getByText('Nada marcado para este dia.')).toBeVisible();
    await button(page, 'Agendar neste dia').click();
    await expect(page.getByRole('heading', { name: 'Novo compromisso' })).toBeVisible();
  });

  test('compromisso pessoal exige título; com título, é agendado e aparece na agenda', async ({ page }) => {
    await onboard(page);
    await page.goto('/compromisso/novo');
    await pickDate(page, 'Data e hora', brDate(2), { hour: '10', minute: '30' });
    await button(page, 'Agendar').click();
    await expect(toast(page, 'Compromisso agendado')).toHaveCount(0);

    await page.getByLabel('Título *').fill('Reunião da equipe');
    await page.getByRole('radio', { name: '45 min', exact: true }).click();
    await page.getByRole('radio', { name: 'Sem lembrete', exact: true }).click();
    await page.getByLabel('Local').fill('Sala 2');
    await button(page, 'Agendar').click();
    await expect(toast(page, 'Compromisso agendado')).toBeVisible();

    await openTab(page, 'Agenda');
    await expect(page.getByRole('heading', { name: 'Próximos' })).toBeVisible();
    await expect(page.getByText('Reunião da equipe').filter({ visible: true }).first()).toBeVisible();
  });

  test('compromisso com paciente: realizado, de volta para agendado, editado e excluído', async ({ page }) => {
    await withDemoData(page);
    await page.goto('/compromisso/novo');
    await page.getByRole('button', { name: /^Selecionar paciente/ }).click();
    await page.getByRole('button', { name: /^Helena Duarte/ }).click();
    await pickDate(page, 'Data e hora', brDate(3), { hour: '09', minute: '00' });
    await page.getByLabel('Título (opcional)').fill('Avaliação inicial');
    await button(page, 'Agendar').click();
    await expect(toast(page, 'Compromisso agendado')).toBeVisible();

    await openTab(page, 'Agenda');
    await page.getByRole('button', { name: /Avaliação inicial/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Avaliação inicial' })).toBeVisible();

    await button(page, 'Realizado').click();
    await expect(toast(page, 'Marcado como realizado')).toBeVisible();
    await button(page, 'Voltar para agendado').click();

    await page.getByLabel('Local').fill('Online');
    await button(page, 'Salvar alterações').click();
    await expect(toast(page, 'Compromisso atualizado')).toBeVisible();

    await button(page, 'Abrir ficha').click();
    await expect(page.getByRole('heading', { name: 'Helena Duarte' }).filter({ visible: true })).toBeVisible();
    await page.goBack();

    answerNextDialog(page, true);
    await button(page, 'Excluir compromisso').click();
    await expect(toast(page, 'Compromisso excluído')).toBeVisible();
  });

  test('o dia escolhido no calendário lista os compromissos dele', async ({ page }) => {
    await onboard(page);
    const day = new Date();
    day.setDate(day.getDate() + 1);
    await page.goto('/compromisso/novo');
    await page.getByLabel('Título *').fill('Supervisão');
    await pickDate(page, 'Data e hora', day.toLocaleDateString('pt-BR'), { hour: '15', minute: '00' });
    await button(page, 'Agendar').click();
    await expect(toast(page, 'Compromisso agendado')).toBeVisible();

    await openTab(page, 'Agenda');
    if (day.getMonth() !== new Date().getMonth()) await button(page, 'Próximo mês').click();
    const label = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' }).format(day);
    await page.getByRole('button', { name: new RegExp(`^${label}`) }).click();
    await expect(page.getByRole('button', { name: new RegExp(`^${label}.*com compromissos`) })).toBeVisible();
    await expect(page.getByText('Supervisão').filter({ visible: true }).first()).toBeVisible();
  });
});
