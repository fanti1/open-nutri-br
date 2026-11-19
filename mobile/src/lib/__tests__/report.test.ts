import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_VERSION } from '../constants';
import { appendErrorEntry, errorLog, makeErrorEntry, MAX_ERROR_ENTRIES, type ErrorEntry } from '../errorLog';
import { issueUrl, MAX_ISSUE_URL_LENGTH, REPO_URL } from '../links';
import { formatDiagnostics, reportIssueUrl, reportText, type DeviceInfo } from '../report';

const params = (url: string) => new URL(url).searchParams;

describe('registro de erros', () => {
  it('guarda mensagem curta, cinco linhas da pilha sem repetir a mensagem, rota e versão', () => {
    const error = new TypeError('x'.repeat(400));
    error.stack = ['TypeError: xxx', ...Array.from({ length: 9 }, (_, i) => `    at f${i} (app.js:${i})`)].join('\n');

    const entry = makeErrorEntry(error, '/paciente/abc', new Date('2026-10-28T12:00:00Z'));

    expect(entry.message).toHaveLength(301);
    expect(entry.stack!.split('\n')).toEqual(['at f0 (app.js:0)', 'at f1 (app.js:1)', 'at f2 (app.js:2)', 'at f3 (app.js:3)', 'at f4 (app.js:4)']);
    expect(entry).toMatchObject({ at: '2026-10-28T12:00:00.000Z', route: '/paciente/abc', appVersion: APP_VERSION });
  });

  it('aceita o que for lançado (texto, objeto, promessa rejeitada sem Error)', () => {
    expect(makeErrorEntry('falhou', null).message).toBe('falhou');
    expect(makeErrorEntry({ code: 1 }, null).message).toBe('[object Object]');
    expect(makeErrorEntry(undefined, null).message).toBe('undefined');
  });

  it(`mantém só os ${MAX_ERROR_ENTRIES} mais recentes e não repete o mesmo erro em sequência`, () => {
    let entries: ErrorEntry[] = [];
    for (let i = 0; i < 30; i++) entries = appendErrorEntry(entries, makeErrorEntry(new Error(`e${i}`), '/'));
    expect(entries).toHaveLength(MAX_ERROR_ENTRIES);
    expect(entries[0].message).toBe('e29');

    const repeated = appendErrorEntry(entries, { ...entries[0], at: '2099-01-01T00:00:00.000Z' });
    expect(repeated).toHaveLength(MAX_ERROR_ENTRIES);
    expect(repeated[0].at).toBe('2099-01-01T00:00:00.000Z');
    expect(repeated[1].message).toBe('e28');
  });

  it('erros de antes do banco abrir são juntados ao que estava gravado e gravados', async () => {
    errorLog.clear();
    errorLog.setRoute('/');
    errorLog.record(new Error('banco ainda fechado'));

    const saved: ErrorEntry[][] = [];
    const stored = [makeErrorEntry(new Error('de ontem'), '/agenda', new Date('2026-10-27T10:00:00Z'))];
    errorLog.attach(stored, async (entries) => void saved.push(entries));

    expect(errorLog.list().map((entry) => entry.message)).toEqual(['banco ainda fechado', 'de ontem']);
    expect(saved).toHaveLength(1);

    errorLog.clear();
    expect(errorLog.list()).toEqual([]);
    expect(saved.at(-1)).toEqual([]);
  });
});

describe('link da issue', () => {
  it('abre o modelo certo com título e campos preenchidos, sem campos vazios', () => {
    const url = issueUrl('bug.yml', '[Problema] Não salva', { descricao: 'Ao tocar em Salvar…', passos: '  ' });
    expect(url.startsWith(`${REPO_URL}/issues/new?`)).toBe(true);
    expect(params(url).get('template')).toBe('bug.yml');
    expect(params(url).get('title')).toBe('[Problema] Não salva');
    expect(params(url).get('descricao')).toBe('Ao tocar em Salvar…');
    expect(params(url).has('passos')).toBe(false);
  });

  it(`corta o diagnóstico para caber em ${MAX_ISSUE_URL_LENGTH} caracteres, mantendo o resto`, () => {
    const diagnostico = 'ção '.repeat(4000);
    const url = issueUrl('bug.yml', 'Título', { descricao: 'Descrição inteira', diagnostico }, 'diagnostico');

    expect(url.length).toBeLessThanOrEqual(MAX_ISSUE_URL_LENGTH);
    expect(params(url).get('descricao')).toBe('Descrição inteira');
    expect(params(url).get('diagnostico')).toContain('cortado para caber no link');
  });
});

describe('relato', () => {
  const info: DeviceInfo = { appVersion: '1.0.0', platform: 'Android 15 (API 35)', screen: '411×914 pt', fontScale: 1.3, theme: 'escuro' };
  const errors = [makeErrorEntry(new Error('Falhou ao abrir'), '/plano/1', new Date('2026-10-28T12:00:00Z'))];
  const diagnostics = formatDiagnostics(info, errors);

  it('diagnóstico com sistema, tela, fonte, tema e erros', () => {
    expect(diagnostics).toContain('Sistema: Android 15 (API 35)');
    expect(diagnostics).toContain('fonte 1.3× · tema escuro');
    expect(diagnostics).toContain('2026-10-28T12:00:00.000Z · v1.0.0 · /plano/1: Falhou ao abrir');
    expect(formatDiagnostics(info, [])).not.toContain('Erros registrados');
  });

  it('problema vai para o modelo de bug com diagnóstico; sugestão vai sem diagnóstico', () => {
    const bug = reportIssueUrl({ kind: 'problema', title: 'PDF em branco', description: 'd', steps: '1. Abrir' }, diagnostics);
    expect(params(bug).get('template')).toBe('bug.yml');
    expect(params(bug).get('title')).toBe('[Problema] PDF em branco');
    expect(params(bug).get('diagnostico')).toBe(diagnostics);

    const idea = reportIssueUrl({ kind: 'sugestao', title: 'Exportar CSV', description: 'd', steps: '' }, diagnostics);
    expect(params(idea).get('template')).toBe('sugestao.yml');
    expect(params(idea).has('diagnostico')).toBe(false);
  });

  it('texto para e-mail ou mensagem', () => {
    const text = reportText({ kind: 'problema', title: 'PDF em branco', description: 'O PDF sai vazio.', steps: '1. Abrir a ficha' }, diagnostics);
    expect(text).toContain('[Problema] PDF em branco\n\nO PDF sai vazio.\n\nPassos para reproduzir:\n1. Abrir a ficha');
    expect(text).toContain('Versão do app: 1.0.0');
  });
});

describe('modelos de issue do repositório', () => {
  const fieldIds = (template: string) =>
    [...readFileSync(join(__dirname, '../../../../.github/ISSUE_TEMPLATE', template), 'utf8').matchAll(/^\s+id: (\w+)\s*$/gm)].map((match) => match[1]);
  const prefilled = (url: string) => [...new URL(url).searchParams.keys()].filter((key) => key !== 'template' && key !== 'title');

  it('cada campo que o app preenche existe no formulário do GitHub', () => {
    const full = { title: 'T', description: 'd', steps: 's' };
    const bug = reportIssueUrl({ kind: 'problema', ...full }, 'diag');
    const idea = reportIssueUrl({ kind: 'sugestao', ...full }, 'diag');
    const divergence = issueUrl('divergencia-cientifica.yml', 'T', { versao: APP_VERSION });

    expect(fieldIds('bug.yml')).toEqual(expect.arrayContaining(prefilled(bug)));
    expect(fieldIds('sugestao.yml')).toEqual(expect.arrayContaining(prefilled(idea)));
    expect(fieldIds('divergencia-cientifica.yml')).toEqual(expect.arrayContaining(prefilled(divergence)));
    expect(prefilled(bug)).toEqual(['descricao', 'passos', 'versao', 'diagnostico']);
  });
});
