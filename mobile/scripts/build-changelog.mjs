// Converte o CHANGELOG.md da raiz em src/data/changelog.json (tela "Novidades").
// Uso: node scripts/build-changelog.mjs  — um teste falha se o JSON estiver desatualizado.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseChangelog } from './lib/changelog.ts';

const here = dirname(fileURLToPath(import.meta.url));
const releases = parseChangelog(readFileSync(join(here, '../../CHANGELOG.md'), 'utf8'));

writeFileSync(join(here, '../src/data/changelog.json'), `${JSON.stringify(releases, null, 2)}\n`);
console.log(`changelog.json: ${releases.length} versões`);
