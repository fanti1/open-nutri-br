// Converte os guias de docs/guia/*.md (Markdown restrito) nos artigos da Central de ajuda.
// Sem imports: roda tanto no Node (scripts/build-help.mjs) quanto no Jest.

export type HelpBlock =
  | { type: 'h2' | 'h3' | 'p' | 'note'; text: string }
  | { type: 'li'; text: string; ordinal?: number };

export interface HelpArticle {
  slug: string;
  title: string;
  summary: string;
  keywords: string[];
  blocks: HelpBlock[];
}

/** Links viram texto (o app não navega entre arquivos .md); negrito fica marcado com ** para o app destacar. */
function inline(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\([*_\\])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "01-primeiros-passos.md" → "primeiros-passos". */
export function slugFromFile(file: string): string {
  return file.replace(/\.md$/, '').replace(/^\d+-/, '');
}

export function parseHelpArticle(file: string, markdown: string): HelpArticle {
  const keywordsMatch = /<!--\s*palavras-chave:\s*([\s\S]*?)-->/.exec(markdown);
  if (!keywordsMatch) throw new Error(`${file}: falta a linha <!-- palavras-chave: ... -->`);

  const lines = markdown.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/);
  const blocks: HelpBlock[] = [];
  let title = '';
  let paragraph: string[] = [];
  let note: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'p', text: inline(paragraph.join(' ')) });
    if (note.length) blocks.push({ type: 'note', text: inline(note.join(' ')) });
    paragraph = [];
    note = [];
  };

  for (const [index, raw] of lines.entries()) {
    const line = raw.trim();
    const where = `${file}:${index + 1}`;

    if (!line) {
      flush();
    } else if (line.startsWith('```') || /^\|.*\|$/.test(line)) {
      throw new Error(`${where}: tabelas e blocos de código não aparecem no app; use parágrafos ou listas`);
    } else if (line.startsWith('# ')) {
      flush();
      if (title) throw new Error(`${where}: o guia só pode ter um título (#)`);
      title = inline(line.slice(2));
    } else if (/^#{2,3} /.test(line)) {
      flush();
      blocks.push({ type: line.startsWith('### ') ? 'h3' : 'h2', text: inline(line.replace(/^#+ /, '')) });
    } else if (line.startsWith('#')) {
      throw new Error(`${where}: só são aceitos títulos #, ## e ###`);
    } else if (line.startsWith('>')) {
      if (paragraph.length) flush();
      note.push(line.replace(/^>\s?/, ''));
    } else if (/^[-*] /.test(line)) {
      flush();
      blocks.push({ type: 'li', text: inline(line.slice(2)) });
    } else if (/^\d+\. /.test(line)) {
      flush();
      const [, number, text] = /^(\d+)\. (.*)$/.exec(line)!;
      blocks.push({ type: 'li', text: inline(text), ordinal: Number(number) });
    } else if (/^!\[[^\]]*\]\([^)]+\)$/.test(line)) {
      // Imagem sozinha na linha (prints no GitHub): fica de fora do app.
    } else {
      if (note.length) flush();
      paragraph.push(line);
    }
  }
  flush();

  if (!title) throw new Error(`${file}: falta o título (#)`);
  const [first, ...rest] = blocks;
  if (first?.type !== 'p') throw new Error(`${file}: o título precisa ser seguido de um parágrafo de resumo`);

  return {
    slug: slugFromFile(file),
    title,
    summary: first.text.replace(/\*\*/g, ''),
    keywords: keywordsMatch[1].split(',').map((keyword) => keyword.trim()).filter(Boolean),
    blocks: rest,
  };
}

/** Artigos na ordem do número do arquivo; o README.md da pasta é o índice do GitHub e fica de fora. */
export function helpFiles(files: string[]): string[] {
  return files.filter((file) => /^\d+-.+\.md$/.test(file)).sort();
}
