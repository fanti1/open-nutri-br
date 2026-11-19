# ADR 0006 — App 100% offline (sem servidor externo)

## Status
Implementado. Complementa a ADR 0003 (dados no aparelho) e remove as duas
últimas dependências de rede que ela ainda aceitava.

## Contexto
Pedido do produto: "deixa tudo offline mesmo no celular da pessoa… sem nuvem
em servidor externo", com a opção de backup no Google Drive. Até aqui, as
curvas de crescimento da OMS e a tabela de alimentos (TACO) eram consultadas no
backend Laravel — no celular, sem apontar para um servidor, elas simplesmente
não funcionavam.

## Decisões

### 1. Curvas da OMS no aparelho
- As 9 tabelas LMS oficiais (`backend/database/data/who/*.txt`, cópia sem
  alteração dos pacotes `anthro`/`anthroplus` da OMS) viram JSON compacto em
  `mobile/src/data/who/` (416 KB) via `mobile/scripts/build-who-tables.mjs`,
  que também verifica que cada eixo é contínuo.
- O motor (`mobile/src/domain/growth/growth.ts`) é espelho linha a linha de
  `backend/app/Domain/Growth`: idade em dias com round_up da OMS, correção de
  ±0,7 cm deitado/em pé, interpolação linear (2007 e peso/comprimento) e
  escore-Z restrito além de ±3 DP.
- As 10 calculadoras pediátricas (8 curvas + Gomez + Waterlow) e os
  classificadores SISVAN foram portados. Os mesmos vetores de
  `shared/calculators-spec/` — com gabarito da própria OMS (ex.: z = −6,09 e
  4,21) — agora passam no PHP **e** no app; a marca `server_only` deixou de
  existir.
- Tabelas carregadas sob demanda (`require` por tabela) para não pesar a abertura.

### 2. TACO completa embarcada
- Fonte: planilha oficial `Taco-4a-Edicao.xlsx` (NEPA-UNICAMP,
  nepa.unicamp.br/publicacoes/tabela-taco-excel). `mobile/scripts/build-taco.mjs`
  gera `mobile/src/data/taco.json`: 597 alimentos, 15 grupos, 324 KB.
- A planilha traz médias sem arredondamento; o script arredonda com a precisão
  da tabela publicada (kcal e minerais majoritários inteiros, macronutrientes
  com 1 casa, micronutrientes traço com 2) e aplica a legenda oficial: `NA` =
  não aplicável, `Tr` = traço (inclusive quando o valor arredondado cai entre 0
  e a menor casa exibida), `*` = análises sendo reavaliadas; célula vazia =
  análise não solicitada. Conferido contra a tabela impressa (ex.: arroz
  integral cozido 124 kcal / 2,6 g proteína; feijão carioca cozido 76 kcal /
  8,5 g fibra).

### 3. Nenhum código de rede no app
Removidos o cliente HTTP (`src/api`), o React Query e a variável
`EXPO_PUBLIC_API_URL`. Todo cálculo é local e em tempo real — não existe mais
botão "Calcular". O teste E2E bloqueia qualquer requisição fora do próprio app e
confirma zero chamadas externas.

### 4. Backup no Google Drive, sem servidor
O backup (arquivo JSON, ADR 0003) é enviado pela folha de compartilhamento do
sistema, onde o Android oferece "Salvar no Drive"; a restauração usa o seletor
de arquivos, que mostra o Google Drive. Não há conta, token ou servidor nosso no
caminho. O Início lembra de fazer backup quando há pacientes e o último backup
foi há mais de 7 dias (ou nunca).

**Alternativa não adotada (por enquanto):** integração direta com a API do
Google Drive (backup automático). Exige registrar um cliente OAuth no Google
Cloud (conta do responsável pelo app, SHA-1 da chave de assinatura e tela de
consentimento verificada pelo Google para escopos de Drive). Pode ser adicionada
depois sem mudar o formato do backup.

## Papel do backend Laravel
Continua no repositório como implementação de referência das fórmulas: os
mesmos vetores de `shared/calculators-spec/` rodam no PHPUnit e no Jest, e o
catálogo do app é gerado a partir dele (`php artisan catalog:export`). O app não
depende dele em tempo de execução.

## Atualização (ADR 0013)
"Relatar um problema" e os links de "Sobre" (código-fonte, licença, fontes de dados)
não quebram a regra: o app não faz a requisição, só abre o navegador ou a folha de
compartilhamento do sistema por ação do usuário, com o texto à vista. O roteiro de
prints (`npm run prints`) falha se o app fizer qualquer requisição externa.
