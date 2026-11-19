// Gera as notas de uma GitHub Release a partir do CHANGELOG.md.
// Uso: node scripts/release-notes.mjs 1.1.0 [arquivo-do-apk]
// Imprime em Markdown: as novidades da versão, como instalar e o SHA-256 do APK (se informado).
// Falha se a versão não estiver no CHANGELOG ou não bater com o app.json (evita lançar a versão errada).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [version, apk] = process.argv.slice(2);
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
  console.error('Uso: node scripts/release-notes.mjs <maior.menor.correção> [arquivo-do-apk]');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const appVersion = JSON.parse(readFileSync(join(root, 'mobile/app.json'), 'utf8')).expo.version;
if (appVersion !== version) {
  console.error(`A tag é ${version}, mas o mobile/app.json está em ${appVersion}. Rode scripts/bump-version.mjs.`);
  process.exit(1);
}

const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8').replace(/\r\n/g, '\n');
const escaped = version.replace(/\./g, '\\.');
const match = changelog.match(new RegExp(`^## \\[${escaped}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|(?![\\s\\S]))`, 'm'));
if (!match || !match[1].trim()) {
  console.error(`Não achei "## [${version}]" com conteúdo no CHANGELOG.md.`);
  process.exit(1);
}

const notes = [match[1].trim(), ''];

notes.push(
  '## Como instalar',
  '',
  '**Android**: baixe o arquivo `.apk` abaixo, abra no celular e confirme a instalação (o Android pede para permitir apps desta fonte). Se já tiver o app, a nova versão instala por cima e mantém seus dados.',
  '',
  '**Navegador e iOS**: por enquanto, a partir do código. Veja [docs/DESENVOLVIMENTO.md](https://github.com/fanti1/open-nutri-br/blob/HEAD/docs/DESENVOLVIMENTO.md).',
  '',
  'Faça um backup (**Mais → Backup**) antes de atualizar. Primeira vez? Comece pelos [Primeiros passos](https://github.com/fanti1/open-nutri-br/blob/HEAD/docs/guia/01-primeiros-passos.md).',
);

if (apk) {
  const sha = createHash('sha256').update(readFileSync(apk)).digest('hex');
  notes.push(
    '',
    '<details><summary>Conferir o arquivo (SHA-256)</summary>',
    '',
    '```',
    `${sha}  ${basename(apk)}`,
    '```',
    '',
    '</details>',
  );
}

console.log(notes.join('\n'));
