import type { HelpArticle, HelpBlock } from '../../../scripts/lib/help';
import rawArticles from '../../data/help.json';
import { CATALOG, normalizeSearch, type CatalogEntry } from '../catalog';

// Gerado por scripts/build-help.mjs a partir de docs/guia/*.md (um teste confere que está atualizado).
export const HELP_ARTICLES = rawArticles as HelpArticle[];

export function helpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}

/** Palavras que não ajudam a achar nada ("como faço o backup" busca por "backup"). */
const STOPWORDS = new Set(
  'a o as os um uma uns umas de do da dos das no na nos nas em e ou para pra por com sem que se eu meu minha me como faco fazer posso onde qual quais quando quero preciso ao aos e é eh esta tem ter'.split(' '),
);

/** Termos da busca, normalizados (sem acento, minúsculos), sem palavras vazias e com plural simples removido. */
export function searchTokens(query: string): string[] {
  return normalizeSearch(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOPWORDS.has(token))
    .map((token) => (token.length > 4 && token.endsWith('s') ? token.slice(0, -1) : token));
}

function words(text: string): string[] {
  return normalizeSearch(text.replace(/\*\*/g, '')).split(/[^a-z0-9]+/).filter(Boolean);
}

/** Uma palavra do texto que começa com o termo (backup → backups; pin → pin, mas não "pino" para termos curtos). */
function matches(textWords: string[], token: string): boolean {
  return textWords.some((word) => (token.length < 3 ? word === token : word.startsWith(token)));
}

export interface ArticleHit {
  article: HelpArticle;
  /** Seção do artigo que melhor responde (null = o artigo como um todo). */
  section: string | null;
  snippet: string;
  score: number;
}

interface Section {
  heading: string | null;
  headingWords: string[];
  bodyWords: string[];
  firstText: string;
}

function sectionsOf(article: HelpArticle): Section[] {
  const sections: Section[] = [{ heading: null, headingWords: [], bodyWords: words(article.summary), firstText: article.summary }];
  for (const block of article.blocks as HelpBlock[]) {
    if (block.type === 'h2') {
      sections.push({ heading: block.text, headingWords: words(block.text), bodyWords: [], firstText: '' });
    } else {
      const current = sections[sections.length - 1];
      if (block.type === 'h3') current.headingWords.push(...words(block.text));
      else current.bodyWords.push(...words(block.text));
      if (!current.firstText && block.type !== 'h3') current.firstText = block.text.replace(/\*\*/g, '');
    }
  }
  return sections;
}

let indexed: { article: HelpArticle; titleWords: string[]; keywordWords: string[]; sections: Section[] }[] | null = null;

function index() {
  indexed ??= HELP_ARTICLES.map((article) => ({
    article,
    titleWords: words(article.title),
    keywordWords: article.keywords.flatMap(words),
    sections: sectionsOf(article),
  }));
  return indexed;
}

/** Guias que respondem à busca: todo termo precisa aparecer no artigo; título e palavras-chave pesam mais. */
export function searchHelp(query: string): ArticleHit[] {
  const tokens = searchTokens(query);
  if (!tokens.length) return [];

  const hits: ArticleHit[] = [];
  for (const { article, titleWords, keywordWords, sections } of index()) {
    const allWords = [...titleWords, ...keywordWords, ...sections.flatMap((section) => [...section.headingWords, ...section.bodyWords])];
    if (!tokens.every((token) => matches(allWords, token))) continue;

    const articleScore = tokens.reduce((sum, token) => sum + (matches(titleWords, token) ? 6 : 0) + (matches(keywordWords, token) ? 4 : 0), 0);
    let best = { section: sections[0], score: -1 };
    for (const section of sections) {
      const score = tokens.reduce((sum, token) => sum + (matches(section.headingWords, token) ? 5 : 0) + (matches(section.bodyWords, token) ? 2 : 0), 0);
      if (score > best.score) best = { section, score };
    }

    hits.push({
      article,
      section: best.score > 0 ? best.section.heading : null,
      snippet: best.score > 0 && best.section.firstText ? best.section.firstText : article.summary,
      score: articleScore + best.score,
    });
  }
  return hits.sort((a, b) => b.score - a.score || a.article.slug.localeCompare(b.article.slug));
}

let calculatorWords: Map<CatalogEntry, { name: string[]; all: string[] }> | null = null;

/** Calculadoras cujo nome, descrição ou identificador contêm todos os termos; nome pesa mais. */
export function searchCalculators(query: string, entries: CatalogEntry[] = CATALOG): CatalogEntry[] {
  const tokens = searchTokens(query);
  if (!tokens.length) return [];
  calculatorWords ??= new Map(
    CATALOG.map((entry) => [entry.slug, entry] as const).map(([slug, entry]) => {
      const name = words(entry.name);
      return [entry, { name, all: [...name, ...words(entry.short_description), ...words(slug.replace(/[-_]/g, ' '))] }];
    }),
  );

  return entries
    .map((entry) => {
      const text = calculatorWords!.get(entry) ?? { name: words(entry.name), all: words(`${entry.name} ${entry.short_description}`) };
      if (!tokens.every((token) => matches(text.all, token))) return null;
      return { entry, score: tokens.filter((token) => matches(text.name, token)).length * 2 - text.name.length * 0.01 };
    })
    .filter((hit): hit is { entry: CatalogEntry; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score)
    .map((hit) => hit.entry);
}
