import { APP_VERSION } from './constants';
import { REPO_URL } from './links';

/** Dados e obras de terceiros embarcados no app (aparecem em "Sobre" e no README). */
export const DATA_CREDITS: { title: string; detail: string; url: string }[] = [
  {
    title: 'Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição',
    detail: 'NEPA/UNICAMP, 2011. 597 alimentos, convertidos da planilha oficial sem alterar os valores.',
    url: 'https://nepa.unicamp.br/publicacoes/tabela-taco-excel/',
  },
  {
    title: 'Padrões de crescimento infantil da OMS (2006) e referência OMS 2007',
    detail: 'Organização Mundial da Saúde. Tabelas LMS dos pacotes anthro e anthroplus, sem alteração.',
    url: 'https://www.who.int/tools/child-growth-standards',
  },
  {
    title: 'Métodos e diretrizes clínicas',
    detail: 'Cada calculadora cita as próprias fontes, com o que foi conferido em cada uma, em "Sobre o método e referência".',
    url: `${REPO_URL}/blob/HEAD/docs/METODOS.md`,
  },
  {
    title: 'Ícones Ionicons',
    detail: 'Ionic, licença MIT, via @expo/vector-icons.',
    url: 'https://ionic.io/ionicons',
  },
];

export const AUTHORS = 'fanti1 e colaboradores';

/**
 * Referência no formato ABNT (NBR 6023), para trabalhos acadêmicos.
 * Sem autor pessoal: a entrada começa pelo título, com a primeira palavra em maiúsculas.
 */
export function abntCitation(version = APP_VERSION, accessed = new Date()): string {
  const month = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'][accessed.getMonth()];
  return (
    `OPENNUTRI BR: ferramentas clínicas abertas para nutricionistas. Versão ${version}. [S. l.], 2026. ` +
    `Software. Disponível em: ${REPO_URL}. Acesso em: ${accessed.getDate()} ${month} ${accessed.getFullYear()}.`
  );
}
