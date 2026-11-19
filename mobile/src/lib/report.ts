import { Dimensions, PixelRatio, Platform } from 'react-native';
import { APP_VERSION } from './constants';
import type { ErrorEntry } from './errorLog';
import { issueUrl } from './links';

/** Informações técnicas do relato: nada que identifique o profissional ou um paciente. */
export interface DeviceInfo {
  appVersion: string;
  platform: string;
  screen: string;
  fontScale: number;
  theme: string;
}

export function deviceInfo(theme: 'claro' | 'escuro'): DeviceInfo {
  const { width, height } = Dimensions.get('window');
  const constants = Platform.constants as { Release?: string };
  const platform =
    Platform.OS === 'android'
      ? `Android ${constants.Release ?? ''} (API ${Platform.Version})`.replace('  ', ' ')
      : Platform.OS === 'ios'
        ? `iOS ${Platform.Version}`
        : `Navegador — ${typeof navigator === 'undefined' ? 'desconhecido' : navigator.userAgent}`;

  return {
    appVersion: APP_VERSION,
    platform,
    screen: `${Math.round(width)}×${Math.round(height)} pt`,
    fontScale: Math.round(PixelRatio.getFontScale() * 100) / 100,
    theme,
  };
}

export function formatDiagnostics(info: DeviceInfo, errors: ErrorEntry[]): string {
  const lines = [
    `Versão do app: ${info.appVersion}`,
    `Sistema: ${info.platform}`,
    `Tela: ${info.screen} · fonte ${info.fontScale}× · tema ${info.theme}`,
  ];

  if (errors.length) {
    lines.push('', `Erros registrados no aparelho (${errors.length}, mais recente primeiro):`);
    for (const error of errors) {
      lines.push(`- ${error.at} · v${error.appVersion} · ${error.route ?? 'tela desconhecida'}: ${error.message}`);
      if (error.stack) lines.push(...error.stack.split('\n').map((line) => `    ${line}`));
    }
  }
  return lines.join('\n');
}

export type ReportKind = 'problema' | 'sugestao';

export interface ReportDraft {
  kind: ReportKind;
  title: string;
  description: string;
  steps: string;
}

const DEFAULT_TITLES: Record<ReportKind, string> = {
  problema: '[Problema] ',
  sugestao: '[Sugestão] ',
};

/** Issue já preenchida (campos com os mesmos ids dos formulários em .github/ISSUE_TEMPLATE). */
export function reportIssueUrl(draft: ReportDraft, diagnostics: string): string {
  const title = DEFAULT_TITLES[draft.kind] + draft.title.trim();
  if (draft.kind === 'sugestao') {
    return issueUrl('sugestao.yml', title, { descricao: draft.description, versao: APP_VERSION });
  }
  return issueUrl('bug.yml', title, { descricao: draft.description, passos: draft.steps, versao: APP_VERSION, diagnostico: diagnostics }, 'diagnostico');
}

/** O mesmo relato em texto corrido, para e-mail ou mensagem. */
export function reportText(draft: ReportDraft, diagnostics: string): string {
  const parts = [`${DEFAULT_TITLES[draft.kind]}${draft.title.trim()}`, '', draft.description.trim()];
  if (draft.kind === 'problema' && draft.steps.trim()) parts.push('', 'Passos para reproduzir:', draft.steps.trim());
  if (draft.kind === 'problema') parts.push('', '---', diagnostics);
  parts.push('', `Enviado pelo OpenNutri BR ${APP_VERSION}`);
  return parts.join('\n');
}
