import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { helpFiles, parseHelpArticle } from '../../../../scripts/lib/help';
import { HELP_ARTICLES, searchCalculators, searchHelp, searchTokens } from '../search';

const guides = join(__dirname, '../../../../../docs/guia');

describe('Central de ajuda', () => {
  it('help.json está atualizado com docs/guia (rode node scripts/build-help.mjs)', () => {
    const expected = helpFiles(readdirSync(guides)).map((file) => parseHelpArticle(file, readFileSync(join(guides, file), 'utf8')));
    expect(HELP_ARTICLES).toEqual(expected);
    expect(HELP_ARTICLES.length).toBeGreaterThanOrEqual(9);
  });

  it('cada artigo tem título, resumo, palavras-chave e seções', () => {
    for (const article of HELP_ARTICLES) {
      expect(article.title).not.toBe('');
      expect(article.summary).not.toBe('');
      expect(article.keywords.length).toBeGreaterThan(3);
      expect(article.blocks.some((block) => block.type === 'h2')).toBe(true);
    }
  });
});

describe('parseHelpArticle', () => {
  const guide = [
    '<!-- palavras-chave: backup, drive -->',
    '# Backup',
    '',
    'Resumo com [link](x.md).',
    '',
    '## Passos',
    '1. Abra **Mais**.',
    '2. Toque.',
    '- item',
    '',
    '![print](../screenshots/a.png)',
    '> Aviso **importante**',
    '> em duas linhas.',
  ].join('\n');

  it('converte o Markdown restrito em blocos', () => {
    expect(parseHelpArticle('06-backup.md', guide)).toEqual({
      slug: 'backup',
      title: 'Backup',
      summary: 'Resumo com link.',
      keywords: ['backup', 'drive'],
      blocks: [
        { type: 'h2', text: 'Passos' },
        { type: 'li', text: 'Abra **Mais**.', ordinal: 1 },
        { type: 'li', text: 'Toque.', ordinal: 2 },
        { type: 'li', text: 'item' },
        { type: 'note', text: 'Aviso **importante** em duas linhas.' },
      ],
    });
  });

  it('recusa o que o app não mostra', () => {
    expect(() => parseHelpArticle('a.md', '# A\n\nResumo')).toThrow('palavras-chave');
    expect(() => parseHelpArticle('a.md', '<!-- palavras-chave: a -->\n# A\n\nResumo\n\n| a | b |')).toThrow('tabelas');
    expect(() => parseHelpArticle('a.md', '<!-- palavras-chave: a -->\n# A\n\n## Seção')).toThrow('resumo');
  });

  it('ignora o README da pasta e ordena pelo número', () => {
    expect(helpFiles(['README.md', '10-z.md', '02-b.md', 'notas.md'])).toEqual(['02-b.md', '10-z.md']);
  });
});

describe('busca', () => {
  const top = (query: string) => searchHelp(query)[0];

  it('ignora acentos, maiúsculas, palavras vazias e plural', () => {
    expect(searchTokens('Como faço o BACKUP dos pacientes?')).toEqual(['backup', 'paciente']);
  });

  it.each([
    ['como faço backup', 'backup-e-seguranca', 'Fazer backup'],
    ['esqueci o pin', 'backup-e-seguranca', 'Esqueci o PIN'],
    ['trocar de celular', 'backup-e-seguranca', null],
    ['recordatório', 'plano-alimentar', null],
    ['leitor de tela', 'acessibilidade', null],
    ['exportar pdf da ficha', 'pacientes', 'Exportar a ficha em PDF'],
    ['lembrete', 'agenda-e-tarefas', 'Lembretes'],
    ['é gratuito?', 'perguntas-frequentes', 'O app é gratuito?'],
  ])('"%s" → %s', (query, slug, section) => {
    expect(top(query)?.article.slug).toBe(slug);
    if (section) expect(top(query)?.section).toBe(section);
  });

  it('sem resultado para termos que não aparecem, e nada para busca vazia', () => {
    expect(searchHelp('xilofone')).toEqual([]);
    expect(searchHelp('  como  ')).toEqual([]);
  });

  it('acha calculadoras pelo nome e exige todos os termos', () => {
    expect(searchCalculators('imc idoso')[0]?.slug).toBe('imc-idoso');
    expect(searchCalculators('imc idoso').map((entry) => entry.slug)).not.toContain('imc');
    expect(searchCalculators('mifflin')[0]?.name).toMatch(/Mifflin/);
    expect(searchCalculators('anemia').length).toBeGreaterThan(0);
  });
});
