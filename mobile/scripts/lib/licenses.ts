// Licenças das dependências de produção, para a tela "Licenças de código aberto".
// Sem imports: roda tanto no Node (scripts/build-licenses.mjs) quanto no Jest.

export interface ThirdPartyLicense {
  name: string;
  version: string;
  license: string;
  url: string;
}

interface LockPackage {
  version?: string;
  license?: string;
  dev?: boolean;
  devOptional?: boolean;
  link?: boolean;
}

/**
 * Licenças que podem ser distribuídas com a GPL-3.0-or-later do OpenNutri BR.
 * Uma licença fora desta lista faz o build-licenses falhar: decida antes de adotar a dependência.
 *
 * OFL-1.1 só entra por causa das fontes (Nunito): o arquivo da fonte vai no app como
 * obra separada, que o código lê (agregação, como a FAQ da GPL descreve para fontes),
 * e não é combinado com o código. Não use OFL para nada que não seja fonte.
 */
export const GPL3_COMPATIBLE = [
  '0BSD',
  'Apache-2.0',
  'BlueOak-1.0.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'CC-BY-4.0',
  'CC0-1.0',
  'ISC',
  'MIT',
  'MPL-2.0',
  'OFL-1.1',
  'Python-2.0',
  'Unlicense',
];

/** "(MIT OR Apache-2.0)" basta uma compatível; "MIT AND Apache-2.0" exige todas. */
export function isCompatible(expression: string): boolean {
  const clean = expression.replace(/[()]/g, '').trim();
  if (/ OR /.test(clean)) return clean.split(/ OR /).some((part) => isCompatible(part));
  if (/ AND /.test(clean)) return clean.split(/ AND /).every((part) => isCompatible(part));
  return GPL3_COMPATIBLE.includes(clean);
}

/** Pacotes de produção do package-lock (v3), ordenados por nome; `path` é a pasta instalada. */
export function productionPackages(lock: { packages: Record<string, LockPackage> }): { name: string; version: string; license: string; path: string }[] {
  return Object.entries(lock.packages)
    .filter(([path, pkg]) => path.startsWith('node_modules/') && !pkg.dev && !pkg.devOptional && !pkg.link)
    .map(([path, pkg]) => ({
      name: path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length),
      version: pkg.version ?? '',
      license: pkg.license ?? 'desconhecida',
      path,
    }))
    .filter((pkg, index, all) => all.findIndex((other) => other.name === pkg.name && other.version === pkg.version) === index)
    .sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
}

/** Endereço público do código-fonte a partir do package.json da dependência. */
export function sourceUrl(manifest: { repository?: string | { url?: string; directory?: string }; homepage?: string }): string | null {
  const repo = typeof manifest.repository === 'string' ? manifest.repository : manifest.repository?.url;
  if (repo) {
    const shorthand = /^(?:github:)?([\w.-]+\/[\w.-]+)$/.exec(repo);
    if (shorthand) return `https://github.com/${shorthand[1]}`;
    const url = repo
      .replace(/^git\+/, '')
      .replace(/^git:\/\//, 'https://')
      .replace(/^ssh:\/\/git@/, 'https://')
      .replace(/^git@([^:]+):/, 'https://$1/')
      .replace(/\.git$/, '');
    if (url.startsWith('https://')) return url;
  }
  return manifest.homepage?.startsWith('https://') ? manifest.homepage : null;
}
