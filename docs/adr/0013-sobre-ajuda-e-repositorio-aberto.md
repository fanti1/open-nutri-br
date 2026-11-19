# ADR 0013 — Sobre, ajuda, relato de erros e repositório aberto

## Status
Implementado. Só camada de interface, documentação e repositório. Nenhuma fórmula,
ponto de corte ou classificação foi alterado (ADR 0009).

## Contexto
O app estava pronto para uso clínico, mas não para ser um projeto aberto:

- Não havia arquivo de licença. Sem ele, o código não é aberto do ponto de vista jurídico,
  e o `composer.json` declarava MIT, herdado do esqueleto do Laravel.
- Faltavam uma tela "Sobre" (versão, novidades, código-fonte, licenças, créditos),
  guias de uso e um caminho para relatar problemas. Erros inesperados caíam numa tela
  genérica, sem registro.
- O README tinha 21 KB de texto técnico, sem prints nem guia, e não havia CHANGELOG,
  CONTRIBUTING, SECURITY, CI nem modelos de issue além do de divergência científica.
- A versão estava escrita à mão em três lugares (`app.json`, `package.json`, `constants.ts`).

## Decisões

### 1. Licença
GPL-3.0-or-later para o código e CC BY 4.0 para documentação e textos. Copyleft porque o
objetivo é que versões derivadas de uma ferramenta clínica continuem abertas e auditáveis.
`scripts/build-licenses.mjs` lista as dependências de produção para a tela "Licenças de
código aberto" e falha se aparecer uma licença incompatível com a GPL-3.0.

### 2. Uma fonte para cada coisa
- **Versão**: só no `app.json`. `APP_VERSION` é lido dele; `scripts/bump-version.mjs` atualiza
  o `package.json`; um teste exige que a última versão do CHANGELOG seja a mesma.
- **Novidades**: `CHANGELOG.md` (Keep a Changelog), convertido em `changelog.json` para a tela
  "Novidades".
- **Ajuda**: os guias em `docs/guia/*.md` valem para o GitHub e para o app. O conversor
  aceita um Markdown restrito e recusa o que o app não mostraria (tabelas, código).

Os três JSON gerados têm teste de "arquivo desatualizado", como o catálogo das calculadoras.

### 3. Relato de problemas sem rede
O app continua sem fazer requisições (regra 8, ADR 0006). "Relatar um problema" monta o
texto na tela, com as informações técnicas visíveis (versão, sistema, tela, escala de
fonte, tema e, se a pessoa quiser, os erros registrados), e:

- abre o navegador numa issue do GitHub já preenchida (os `id` dos campos dos formulários em
  `.github/ISSUE_TEMPLATE` são os parâmetros da URL; um teste confere que batem), cortando o
  diagnóstico para caber no limite da URL; ou
- abre a folha de compartilhamento do sistema com o mesmo texto.

É uma saída de dados iniciada pelo profissional, como o backup e o PDF. Ela não leva dados
de pacientes, e a tela pede que eles não sejam digitados.

### 4. Registro local de erros
`errorLog` guarda os 20 erros inesperados mais recentes (mensagem de até 300 caracteres,
5 linhas da pilha, tela, versão), vindos do `ErrorBoundary` e de um handler global
(`ErrorUtils` no nativo, `error`/`unhandledrejection` na web). Fica nas configurações do
aparelho, fora do backup (`DEVICE_ONLY_SETTINGS`), e é gravado sem `notifyChange`: um erro
numa tela não pode disparar novas renderizações. Erros de antes de o banco abrir ficam em
memória e são gravados quando ele abre. A tela de erro ganhou "Relatar este problema", que
não depende do banco nem do roteador.

### 5. Ajuda offline, sem IA generativa
Avaliamos embutir um modelo de linguagem pequeno (SLM) para responder dúvidas e
descartamos por agora:

- **Tamanho**: um modelo útil em português ocupa de 400 MB a 1 GB, contra cerca de 31 MB do APK.
- **Risco clínico**: um modelo generativo pode inventar respostas, o que contraria a regra
  "fonte primária ou nada".
- **Custo**: exigiria um módulo nativo (llama.cpp ou ExecuTorch) e testes próprios.

A Central de ajuda faz busca determinística: ignora acentos e palavras vazias, casa por
prefixo, exige todos os termos e dá mais peso a título e palavras-chave. Ela busca nos guias
e nas calculadoras do catálogo, e toda resposta é um trecho escrito e revisado.

Caminho futuro, se houver demanda: busca semântica só de recuperação (um modelo de
embeddings pequeno, que devolve trechos dos guias e não gera texto); depois, um modelo
generativo opcional, instalado à parte, restrito aos guias e com aviso.

### 6. Acessibilidade
- Papéis e rótulos nos tocáveis que só tinham rótulo; rótulos específicos ("Excluir arquivo: exame.pdf").
- Caixa de seleção e linha da tarefa, e estrela e linha da calculadora, viraram alvos irmãos.
  Um botão dentro de outro é HTML inválido e fica inalcançável no VoiceOver.
- Gráfico de evolução com resumo falado (`chartSummary`) e opção "Ver como tabela".
- "Reduzir movimento" do sistema desliga as transições de tela e a animação dos painéis.
- Toasts e erros de campo (`TextField`) anunciados também no iOS, onde regiões vivas não funcionam.
- `lang="pt-BR"` na versão web (`expo.web.lang`).
- Área de toque de 44 nas pílulas e no controle segmentado.
- `ListItem` ganhou `external`: papel de link, ícone de "abrir fora" e a dica "Abre no navegador".
- Declaração de acessibilidade em `docs/guia/08-acessibilidade.md`, com as limitações conhecidas.

### 7. O repositório como página do projeto
Não há site: a "página" é o próprio GitHub.

- O README virou vitrine, com prints claro/escuro via `<picture>`, destaques, download e
  tabela de calculadoras. O conteúdo técnico foi para `docs/ARQUITETURA.md`,
  `CONFIABILIDADE.md`, `PRIVACIDADE.md` e `DESENVOLVIMENTO.md`.
- Arquivos da comunidade: `CONTRIBUTING`, `CODE_OF_CONDUCT` (Contributor Covenant 2.1),
  `SECURITY` (relato privado pelo GitHub), `SUPPORT`, `CITATION.cff`, modelos de issue em
  formulário, modelo de PR e CI (testes do app e do backend).
- Os prints saem de `npm run prints`. O roteiro restaura um backup **fictício** pela tela de
  Backup, captura os dois temas e falha se o app fizer requisição externa ou registrar erro
  no console.
- `docs/RELEASE.md` descreve como lançar uma versão (tag, notas do CHANGELOG, APK na release).

## Consequências
- Toda mudança visível para quem usa o app entra em "Não lançado" no CHANGELOG.
- Guias novos seguem o Markdown restrito de `docs/guia/README.md`.
- Um campo novo num formulário de issue que o app preencha exige o mesmo `id` nos dois lados.
- Dependência nova precisa de licença compatível com a GPL-3.0; o build das licenças avisa.
- O e-mail de contato do Código de Conduta precisa ser definido antes de publicar o repositório.
- Ao gerar os prints, apareceu um erro que já existia: o editor do plano alimentar quebrava ao
  abrir. O React Compiler lia `pickerMeal.key` (de um `pickerMeal!.key` dentro de um callback)
  como dependência durante a renderização. A correção lê a chave com `?.` no render. Vale a
  regra: não usar `x!.campo` de estado anulável dentro de callbacks.
