import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { latestReleased, parseChangelog } from '../../../scripts/lib/changelog';
import { isCompatible, productionPackages, sourceUrl } from '../../../scripts/lib/licenses';
import appConfig from '../../../app.json';
import { APP_VERSION } from '../../lib/constants';
import changelog from '../changelog.json';
import licenses from '../licenses.json';

const root = join(__dirname, '../../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('versão do app', () => {
  it('app.json, package.json e a última versão lançada do CHANGELOG são a mesma', () => {
    const pkg = JSON.parse(read('package.json'));
    const releases = parseChangelog(read('../CHANGELOG.md'));

    expect(APP_VERSION).toBe(appConfig.expo.version);
    expect(pkg.version).toBe(APP_VERSION);
    expect(latestReleased(releases)).toBe(APP_VERSION);
  });

  it('changelog.json está atualizado (rode node scripts/build-changelog.mjs)', () => {
    expect(changelog).toEqual(parseChangelog(read('../CHANGELOG.md')));
  });
});

describe('parseChangelog', () => {
  const sample = [
    '# Novidades',
    '<!-- comentário com ## [9.9.9] -->',
    '## [Não lançado]',
    '## [1.1.0] - 2026-11-02',
    'Resumo da versão com **negrito**.',
    '### Corrigido',
    '- Item com [link](https://x.y) e `código`.',
    '## [1.0.0] - 2026-10-28',
    '### Adicionado',
    '- Primeiro.',
  ].join('\n');

  it('lê versões, datas, resumo e itens sem marcação; ignora "Não lançado" vazio e comentários', () => {
    expect(parseChangelog(sample)).toEqual([
      { version: '1.1.0', date: '2026-11-02', summary: 'Resumo da versão com negrito.', changes: [{ kind: 'Corrigido', items: ['Item com link e código.'] }] },
      { version: '1.0.0', date: '2026-10-28', summary: null, changes: [{ kind: 'Adicionado', items: ['Primeiro.'] }] },
    ]);
    expect(latestReleased(parseChangelog(sample))).toBe('1.1.0');
  });

  it('recusa seção fora do Keep a Changelog', () => {
    expect(() => parseChangelog('## [1.0.0] - 2026-10-28\n### Novidades\n- x')).toThrow('Novidades');
  });

  it('"Não lançado" com itens aparece, sem data, e não conta como versão lançada', () => {
    const releases = parseChangelog('## [Não lançado]\n### Alterado\n- y\n## [1.0.0] - 2026-10-28\n### Adicionado\n- x');
    expect(releases[0]).toMatchObject({ version: 'Não lançado', date: null });
    expect(latestReleased(releases)).toBe('1.0.0');
  });
});

describe('licenças de terceiros', () => {
  it('licenses.json está atualizado (rode node scripts/build-licenses.mjs)', () => {
    const expected = productionPackages(JSON.parse(read('package-lock.json'))).map(({ name, version, license }) => ({ name, version, license }));
    expect(licenses.map(({ name, version, license }) => ({ name, version, license }))).toEqual(expected);
  });

  it('toda dependência de produção tem licença compatível com a GPL-3.0-or-later', () => {
    expect(licenses.filter((pkg) => !isCompatible(pkg.license))).toEqual([]);
  });

  it('expressões SPDX com OR e AND', () => {
    expect(isCompatible('(BSD-3-Clause OR GPL-2.0)')).toBe(true);
    expect(isCompatible('MIT AND Apache-2.0')).toBe(true);
    expect(isCompatible('MIT AND SSPL-1.0')).toBe(false);
    expect(isCompatible('UNLICENSED')).toBe(false);
  });

  it('endereço do código-fonte a partir do campo repository', () => {
    expect(sourceUrl({ repository: { url: 'git+https://github.com/paulmillr/noble-ciphers.git' } })).toBe('https://github.com/paulmillr/noble-ciphers');
    expect(sourceUrl({ repository: 'git@github.com:a/b.git' })).toBe('https://github.com/a/b');
    expect(sourceUrl({ repository: 'github:a/b' })).toBe('https://github.com/a/b');
    expect(sourceUrl({ repository: 'a/b' })).toBe('https://github.com/a/b');
    expect(sourceUrl({ homepage: 'https://x.dev' })).toBe('https://x.dev');
    expect(sourceUrl({})).toBeNull();
  });
});
