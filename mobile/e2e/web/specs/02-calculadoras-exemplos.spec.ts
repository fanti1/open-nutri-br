import type { Page } from '@playwright/test';
import { fieldsAnsweredByProfile } from '../../../src/domain/calculatorProfile';
import { lifeStageFromAge } from '../../../src/domain/calculators/support/lifeStage';
import type { LifeStage } from '../../../src/domain/calculators/types';
import { CATALOG, type CatalogEntry } from '../../../src/domain/catalog';
import { classificationLabel, fieldLabel, formatFieldValue, optionLabel } from '../../../src/domain/forms/fieldLabels';
import { schemaToFields } from '../../../src/domain/forms/schemaToFields';
import { expect, onboard, test } from '../fixtures';

/**
 * Para CADA calculadora do catálogo, o exemplo resolvido publicado na auditoria
 * científica é digitado na tela real (perfil, campos numéricos, opções) e o
 * resultado e a classificação exibidos têm de ser exatamente os publicados.
 */

function stageFor(entry: CatalogEntry): LifeStage {
  const age = entry.audit.example.inputs.age_years;
  if (typeof age === 'number' && entry.life_stages.includes(lifeStageFromAge(age))) return lifeStageFromAge(age);
  if (entry.life_stages.includes('adulto')) return 'adulto';
  return entry.life_stages[0];
}

/** Preenche o formulário com as entradas do exemplo, campo a campo, como o profissional faria. */
async function typeExample(page: Page, entry: CatalogEntry): Promise<void> {
  const { inputs } = entry.audit.example;
  const answered = fieldsAnsweredByProfile(entry.input_schema);

  for (const field of schemaToFields(entry.input_schema)) {
    const value = inputs[field.name];
    if (value === undefined || value === null || answered.includes(field.name)) continue;
    const label = `${fieldLabel(field.name)}${field.required || field.requiredIf ? ' *' : ''}`;

    if (field.type === 'select' || field.type === 'boolean') {
      const option = field.type === 'boolean' ? (value ? 'Sim' : 'Não') : optionLabel(String(value));
      await page.getByRole('radiogroup', { name: label, exact: true }).getByRole('radio', { name: option, exact: true }).click();
    } else {
      await page.getByLabel(label, { exact: true }).fill(String(value).replace('.', ','));
    }
  }
}

test.describe('Todas as calculadoras: exemplo publicado digitado na tela', () => {
  for (const entry of CATALOG) {
    test(`${entry.name} (${entry.slug})`, async ({ page }) => {
      const { inputs, expected } = entry.audit.example;
      await onboard(page);
      await page.goto(`/calculadora/${entry.slug}?faixa=${stageFor(entry)}`);
      await expect(page.getByRole('heading', { name: entry.name, exact: true })).toBeVisible();

      // Perfil do cálculo: a faixa vem da aba Calculadoras; o sexo é escolhido aqui.
      const sex = inputs.sex === 'male' ? 'Masculino' : 'Feminino';
      await page.getByRole('tab', { name: sex, exact: true }).click();

      await typeExample(page, entry);

      for (const [key, value] of Object.entries(expected.values)) {
        await expect(page.getByLabel(`${fieldLabel(key)}: ${formatFieldValue(key, value)}`, { exact: true }).first()).toBeVisible();
      }
      if (expected.classification) {
        await expect(page.getByText(classificationLabel(expected.classification), { exact: true }).first()).toBeVisible();
      }
      // A barra fixa mostra o mesmo resultado e permite salvar.
      await expect(page.getByRole('button', { name: 'Salvar no histórico' })).toBeEnabled();
    });
  }
});
