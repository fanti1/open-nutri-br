import type { MealPlan, MealPlanItem, Profile } from '../../data/models';
import { macroDistribution } from '../../domain/nutrition';
import { formatDate, formatNumber } from '../../lib/format';
import { itemsByMeal, planTotals } from './planTotals';

function escape(text: string | null | undefined): string {
  return (text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

/**
 * HTML do plano alimentar / recordatório para PDF: refeições com alimentos,
 * quantidades e medidas caseiras, totais e distribuição de energia. Função
 * pura (sem banco nem arquivos), para poder ser testada.
 */
export function buildMealPlanHtml(input: {
  plan: MealPlan;
  items: MealPlanItem[];
  patientName: string | null;
  profile: Profile;
  generatedAt?: Date;
}): string {
  const { plan, items, patientName, profile } = input;
  const generatedAt = input.generatedAt ?? new Date();
  const totals = planTotals(items);
  const split = macroDistribution(totals.values);
  const kindLabel = plan.kind === 'plano' ? 'Plano alimentar' : 'Recordatório 24 horas';
  const professional = [profile.name, profile.crn_number && `CRN ${profile.crn_state ? `${profile.crn_state} ` : ''}${profile.crn_number}`]
    .filter(Boolean)
    .join(' — ');

  const meals = itemsByMeal(items)
    .filter((meal) => meal.items.length > 0)
    .map(
      (meal) => `
      <div class="meal">
        <div class="meal-title">${escape(meal.label)} <span class="muted">· ${formatNumber(Math.round(meal.kcal))} kcal</span></div>
        <table>
          ${meal.items
            .map(
              (item) =>
                `<tr><td>${escape(item.food_name)}</td><td class="qty">${formatNumber(item.quantity_g)} g${
                  item.household_measure ? ` <span class="muted">(${escape(item.household_measure)})</span>` : ''
                }</td></tr>`,
            )
            .join('')}
        </table>
      </div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${escape(kindLabel)}${patientName ? ` — ${escape(patientName)}` : ''}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #102324; margin: 32px; font-size: 12px; }
  h1 { color: #046E58; font-size: 20px; margin: 0; }
  .muted { color: #4B5F60; font-weight: 400; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #046E58; padding-bottom: 8px; margin-bottom: 16px; }
  .meal { border: 1px solid #D7E2E0; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; page-break-inside: avoid; }
  .meal-title { font-weight: 700; color: #046E58; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 4px 0; border-bottom: 1px solid #E6EFEE; }
  td.qty { text-align: right; white-space: nowrap; }
  .totals { background: #E6EFEE; border-radius: 8px; padding: 10px 12px; margin-top: 14px; }
  footer { margin-top: 28px; font-size: 10px; color: #5C6D6D; }
</style></head>
<body>
  <div class="header">
    <div><h1>${escape(kindLabel)}</h1><div class="muted">${escape(professional || 'OpenNutri BR')}</div></div>
    <div class="muted">${escape(formatDate((plan.reference_date ?? generatedAt.toISOString())))}</div>
  </div>
  ${patientName ? `<p><b>Paciente:</b> ${escape(patientName)}</p>` : ''}
  ${meals || '<p class="muted">Nenhum alimento adicionado.</p>'}
  <div class="totals">
    <b>Total do dia:</b> ${formatNumber(Math.round(totals.values.energy_kcal))} kcal${totals.incomplete.has('energy_kcal') ? ' (mínimo — há alimento com valor em reavaliação na TACO)' : ''}${
      plan.target_kcal ? ` · meta ${formatNumber(Math.round(plan.target_kcal))} kcal` : ''
    }<br>
    Proteína ${formatNumber(Math.round(totals.values.protein_g))} g (${formatNumber(Math.round(split.protein))}%) ·
    Carboidrato ${formatNumber(Math.round(totals.values.carbohydrate_g))} g (${formatNumber(Math.round(split.carbohydrate))}%) ·
    Lipídios ${formatNumber(Math.round(totals.values.lipid_g))} g (${formatNumber(Math.round(split.lipid))}%) ·
    Fibras ${formatNumber(Math.round(totals.values.fiber_g))} g
  </div>
  ${plan.notes ? `<p><b>Orientações:</b><br>${escape(plan.notes)}</p>` : ''}
  <footer>Composição calculada com a TACO — Tabela Brasileira de Composição de Alimentos, 4ª ed. (NEPA-UNICAMP, 2011). Gerado pelo OpenNutri BR em ${escape(
    formatDate(generatedAt.toISOString()),
  )}.</footer>
</body></html>`;
}
