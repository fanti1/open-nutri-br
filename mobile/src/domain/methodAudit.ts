/**
 * Auditoria científica de cada método (shared/auditoria, embarcada no catálogo
 * por `php artisan catalog:export`): o que foi conferido, em qual fonte e com
 * qual grau de acesso. O mesmo conteúdo está em docs/METODOS.md.
 */
export type AuditStatus = 'conferido' | 'conferido_com_ressalvas' | 'pendente' | 'divergente';

export type AuditEvidence = 'texto_completo' | 'documento_oficial' | 'resumo' | 'reproducao' | 'nao_acessado';

export interface AuditSource {
  citation: string;
  url: string;
  pmid?: string;
  evidence: AuditEvidence;
  /** O que foi conferido nesta fonte (tabela, equação, recomendação). */
  checked: string;
}

export interface MethodAudit {
  status: AuditStatus;
  /** AAAA-MM-DD */
  verified_at: string;
  summary: string;
  formula: string;
  sources: AuditSource[];
  notes: string[];
  changes: { date: string; version: string; text: string }[];
  example: {
    inputs: Record<string, unknown>;
    calculation: string;
    expected: { values: Record<string, number>; classification: string | null };
  };
}

export const AUDIT_STATUS_LABELS: Record<AuditStatus, string> = {
  conferido: 'Conferido na fonte',
  conferido_com_ressalvas: 'Conferido, com ressalvas',
  pendente: 'Conferência pendente',
  divergente: 'Divergência encontrada',
};

export const AUDIT_STATUS_DESCRIPTIONS: Record<AuditStatus, string> = {
  conferido: 'Todos os coeficientes e pontos de corte foram conferidos em fonte primária ou documento oficial.',
  conferido_com_ressalvas: 'Conferido, mas parte depende de resumo ou de reprodução em artigo aberto, ou a fonte tem ambiguidade.',
  pendente: 'Algum parâmetro ainda não pôde ser conferido na fonte. Nada foi alterado de memória.',
  divergente: 'O método do app não corresponde à fonte citada ou à diretriz vigente. Use com cautela.',
};

export const EVIDENCE_LABELS: Record<AuditEvidence, string> = {
  texto_completo: 'Texto completo',
  documento_oficial: 'Documento oficial',
  resumo: 'Resumo (PubMed)',
  reproducao: 'Reprodução em artigo aberto',
  nao_acessado: 'Fonte não acessada',
};

export type AuditTone = 'success' | 'info' | 'warning' | 'danger';

export const AUDIT_STATUS_TONE: Record<AuditStatus, AuditTone> = {
  conferido: 'success',
  conferido_com_ressalvas: 'info',
  pendente: 'warning',
  divergente: 'danger',
};

/** AAAA-MM-DD → DD/MM/AAAA */
export function auditDate(iso: string): string {
  return iso.split('-').reverse().join('/');
}
