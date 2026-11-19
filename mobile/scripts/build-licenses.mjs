// Gera src/data/licenses.json (tela "Licenças de código aberto") a partir do
// package-lock.json e do package.json de cada dependência instalada.
// Falha se alguma licença não for compatível com a GPL-3.0-or-later.
// Uso (depois de npm install/ci): node scripts/build-licenses.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCompatible, productionPackages, sourceUrl } from './lib/licenses.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));

const packages = productionPackages(lock);
const incompatible = packages.filter((pkg) => !isCompatible(pkg.license));
if (incompatible.length) {
  console.error('Licenças incompatíveis com a GPL-3.0-or-later ou desconhecidas:');
  for (const pkg of incompatible) console.error(`  ${pkg.name}@${pkg.version}: ${pkg.license}`);
  process.exit(1);
}

const licenses = packages.map(({ path, ...pkg }) => {
  const manifestPath = join(root, path, 'package.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
  // Pacotes de outra plataforma (ex.: lightningcss-linux-*) não estão instalados: página do npm.
  return { ...pkg, url: sourceUrl(manifest) ?? `https://www.npmjs.com/package/${pkg.name}` };
});

writeFileSync(join(root, 'src/data/licenses.json'), `${JSON.stringify(licenses)}\n`);
console.log(`licenses.json: ${licenses.length} pacotes`);
