import { Linking } from 'react-native';
import { toast } from '../ui/Toast';

/** Repositório público do projeto. `HEAD` aponta para o ramo padrão, qualquer que seja o nome. */
export const REPO_URL = 'https://github.com/fanti1/open-nutri-br';

export const REPO_LINKS = {
  source: REPO_URL,
  license: `${REPO_URL}/blob/HEAD/LICENSE`,
  changelog: `${REPO_URL}/blob/HEAD/CHANGELOG.md`,
  guide: `${REPO_URL}/tree/HEAD/docs/guia`,
  methods: `${REPO_URL}/blob/HEAD/docs/METODOS.md`,
  releases: `${REPO_URL}/releases`,
  security: `${REPO_URL}/security/advisories/new`,
  citation: `${REPO_URL}/blob/HEAD/CITATION.cff`,
};

/** Modelos de issue em .github/ISSUE_TEMPLATE (os ids dos campos são os parâmetros de pré-preenchimento). */
export type IssueTemplate = 'bug.yml' | 'sugestao.yml' | 'divergencia-cientifica.yml';

/** Abaixo do limite prático de URL de navegadores e do GitHub. */
export const MAX_ISSUE_URL_LENGTH = 7500;

const CUT_MARK = '\n… (cortado para caber no link; use "Enviar de outro jeito" para o texto completo)';

/**
 * Link de uma issue nova já preenchida. Se passar do limite, corta o campo
 * `truncate` (o mais longo e menos essencial, em geral o diagnóstico).
 */
export function issueUrl(template: IssueTemplate, title: string, fields: Record<string, string>, truncate?: string): string {
  const build = (values: Record<string, string>) => {
    const params = new URLSearchParams({ template, title });
    for (const [key, value] of Object.entries(values)) if (value.trim()) params.set(key, value);
    return `${REPO_URL}/issues/new?${params.toString()}`;
  };

  const url = build(fields);
  const full = truncate ? fields[truncate] : undefined;
  if (url.length <= MAX_ISSUE_URL_LENGTH || !truncate || !full) return url;

  // Maior começo do campo que ainda cabe (o tamanho codificado varia com acentos e quebras de linha).
  const withPrefix = (length: number) => build({ ...fields, [truncate]: length ? full.slice(0, length) + CUT_MARK : '' });
  let low = 0;
  let high = full.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (withPrefix(middle).length <= MAX_ISSUE_URL_LENGTH) low = middle;
    else high = middle - 1;
  }
  return withPrefix(low);
}

/** Abre um endereço no navegador ou app do sistema. O app em si não faz requisições. */
export async function openExternal(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    toast.error('Não foi possível abrir o link neste aparelho.');
  }
}
