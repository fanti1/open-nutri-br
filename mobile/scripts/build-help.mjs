// Gera src/data/help.json (Central de ajuda, offline) a partir dos guias em docs/guia/*.md.
// Uso: node scripts/build-help.mjs  — um teste falha se o JSON estiver desatualizado.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { helpFiles, parseHelpArticle } from './lib/help.ts';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '../../docs/guia');

const articles = helpFiles(readdirSync(source)).map((file) => parseHelpArticle(file, readFileSync(join(source, file), 'utf8')));

writeFileSync(join(here, '../src/data/help.json'), `${JSON.stringify(articles, null, 2)}\n`);
console.log(`help.json: ${articles.length} artigos`);
