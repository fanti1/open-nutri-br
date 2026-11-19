// Sobe a versão do app em todos os lugares que a declaram.
// Uso: node scripts/bump-version.mjs 1.1.0
// Depois: mova os itens de "Não lançado" do CHANGELOG.md para a nova versão e rode build-changelog.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
  console.error('Uso: node scripts/bump-version.mjs <maior.menor.correção>');
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const files = {
  'mobile/app.json': (json) => (json.expo.version = version),
  'mobile/package.json': (json) => (json.version = version),
};

for (const [file, update] of Object.entries(files)) {
  const path = join(here, '../..', file);
  const json = JSON.parse(readFileSync(path, 'utf8'));
  update(json);
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`${file}: ${version}`);
}
