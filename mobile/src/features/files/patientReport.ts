import type { Consultation, Patient, Profile, SavedCalculation } from '../../data/models';
import { classificationLabel, fieldLabel, formatFieldValue } from '../../domain/forms/fieldLabels';
import { formatAge, formatDate, formatDateTime, formatNumber } from '../../lib/format';
import { sexLabel } from '../patients/patientHelpers';

const KIND_LABELS = { consulta: 'Consulta', retorno: 'Retorno', avaliacao: 'Avaliação' } as const;

function escape(text: string | null | undefined): string {
  return (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

function measures(c: Consultation): string {
  const parts = [
    c.weight_kg != null && `Peso ${formatNumber(c.weight_kg)} kg`,
    c.height_cm != null && `Estatura ${formatNumber(c.height_cm)} cm`,
    c.waist_cm != null && `Cintura ${formatNumber(c.waist_cm)} cm`,
    c.hip_cm != null && `Quadril ${formatNumber(c.hip_cm)} cm`,
    c.head_circumference_cm != null && `PC ${formatNumber(c.head_circumference_cm)} cm`,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
}

/**
 * HTML da ficha do paciente para impressão/PDF: identificação do profissional,
 * dados do paciente, atendimentos (com medidas) e cálculos com classificação.
 * Função pura (sem acesso a banco/arquivos), para poder ser testada.
 */
export function buildPatientReportHtml(input: {
  patient: Patient;
  consultations: Consultation[];
  calculations: SavedCalculation[];
  profile: Profile;
  generatedAt?: Date;
}): string {
  const { patient, consultations, calculations, profile } = input;
  const generatedAt = input.generatedAt ?? new Date();
  const professional = [profile.name, profile.crn_number && `CRN ${profile.crn_state ? `${profile.crn_state} ` : ''}${profile.crn_number}`]
    .filter(Boolean)
    .join(' — ');

  const consultationRows = consultations
    .map(
      (c) => `
      <div class="block">
        <div class="block-title">${KIND_LABELS[c.kind]} · ${escape(formatDateTime(c.occurred_at))}</div>
        <div class="muted">${escape(measures(c))}</div>
        ${c.complaint ? `<p><b>Motivo:</b> ${escape(c.complaint)}</p>` : ''}
        ${c.notes ? `<p><b>Evolução:</b> ${escape(c.notes)}</p>` : ''}
        ${c.plan ? `<p><b>Conduta:</b> ${escape(c.plan)}</p>` : ''}
      </div>`,
    )
    .join('');

  const calculationRows = calculations
    .map((calc) => {
      const values = Object.entries(calc.values)
        .map(([key, value]) => `${escape(fieldLabel(key))}: ${escape(formatFieldValue(key, value))}`)
        .join('<br>');
      return `<tr><td>${escape(formatDate(calc.created_at))}</td><td>${escape(calc.calculator_name)}</td><td>${values}</td><td>${
        calc.classification ? escape(classificationLabel(calc.classification)) : '—'
      }</td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Ficha — ${escape(patient.name)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #102324; margin: 32px; font-size: 12px; }
  h1 { color: #046E58; font-size: 20px; margin: 0; }
  h2 { font-size: 14px; color: #046E58; border-bottom: 1px solid #D7E2E0; padding-bottom: 4px; margin-top: 24px; }
  .muted { color: #4B5F60; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #046E58; padding-bottom: 8px; margin-bottom: 12px; }
  .block { border: 1px solid #D7E2E0; border-radius: 8px; padding: 8px 12px; margin-bottom: 8px; }
  .block-title { font-weight: 700; margin-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 6px; border-bottom: 1px solid #D7E2E0; vertical-align: top; }
  th { background: #E6EFEE; }
  p { margin: 4px 0; }
  footer { margin-top: 32px; font-size: 10px; color: #5C6D6D; }
</style></head>
<body>
  <div class="header">
    <div><h1>Ficha nutricional</h1><div class="muted">${escape(professional || 'OpenNutri BR')}</div></div>
    <div class="muted">Gerado em ${escape(formatDateTime(generatedAt.toISOString()))}</div>
  </div>
  <div><b>${escape(patient.name)}</b></div>
  <div class="muted">${escape(sexLabel(patient.sex))} · ${escape(formatAge(patient.birth_date, generatedAt))} · nascimento ${escape(formatDate(patient.birth_date))}</div>
  ${patient.notes ? `<p><b>Observações:</b> ${escape(patient.notes)}</p>` : ''}

  <h2>Atendimentos (${consultations.length})</h2>
  ${consultationRows || '<p class="muted">Nenhum atendimento registrado.</p>'}

  <h2>Cálculos (${calculations.length})</h2>
  ${
    calculationRows
      ? `<table><thead><tr><th>Data</th><th>Método</th><th>Resultado</th><th>Classificação</th></tr></thead><tbody>${calculationRows}</tbody></table>`
      : '<p class="muted">Nenhum cálculo salvo.</p>'
  }

  <footer>Documento gerado pelo OpenNutri BR. Os cálculos seguem os métodos e referências científicas indicados no aplicativo e não substituem o julgamento clínico do profissional.</footer>
</body></html>`;
}
