// Lê o CHANGELOG.md da raiz (formato Keep a Changelog) para a tela "Novidades".
// Sem imports: roda tanto no Node (scripts/build-changelog.mjs) quanto no Jest.

export type ChangeKind = 'Adicionado' | 'Alterado' | 'Corrigido' | 'Removido' | 'Segurança';

export interface Release {
  version: string;
  /** AAAA-MM-DD; null em "Não lançado". */
  date: string | null;
  summary: string | null;
  changes: { kind: ChangeKind; items: string[] }[];
}

const KINDS: readonly string[] = ['Adicionado', 'Alterado', 'Corrigido', 'Removido', 'Segurança'];
export const UNRELEASED = 'Não lançado';

/** Tira a marcação inline que o app não renderiza (links, negrito, código). */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

export function parseChangelog(markdown: string): Release[] {
  const releases: Release[] = [];
  let release: Release | null = null;
  let kind: Release['changes'][number] | null = null;

  for (const raw of markdown.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    const line = raw.trim();
    const heading = /^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?\s*$/.exec(line);

    if (heading) {
      release = { version: heading[1], date: heading[2] ?? null, summary: null, changes: [] };
      kind = null;
      releases.push(release);
      continue;
    }
    if (!release) continue;

    if (line.startsWith('### ')) {
      const name = line.slice(4).trim();
      if (!KINDS.includes(name)) throw new Error(`CHANGELOG: seção "${name}" em ${release.version} não é uma das ${KINDS.join(', ')}`);
      kind = { kind: name as ChangeKind, items: [] };
      release.changes.push(kind);
    } else if (line.startsWith('- ')) {
      if (!kind) throw new Error(`CHANGELOG: item fora de seção em ${release.version}`);
      kind.items.push(plainText(line.slice(2)));
    } else if (line && !kind) {
      release.summary = release.summary ? `${release.summary} ${plainText(line)}` : plainText(line);
    }
  }

  return releases.filter((entry) => entry.version !== UNRELEASED || entry.changes.length > 0);
}

/** Versão mais recente já lançada (a que o app.json deve declarar). */
export function latestReleased(releases: Release[]): string | undefined {
  return releases.find((entry) => entry.version !== UNRELEASED)?.version;
}
