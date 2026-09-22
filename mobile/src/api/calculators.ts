import { apiRequest } from './client';

export interface ServerCalculation {
  values: Record<string, number>;
  classification: string | null;
  formula_version: string;
}

/** Cálculo feito pelo servidor — usado nas calculadoras que dependem das tabelas da OMS. */
export function calculateOnServer(slug: string, inputs: Record<string, unknown>): Promise<ServerCalculation> {
  return apiRequest(`/calculators/${slug}/calculate`, { method: 'POST', body: inputs });
}
