# ADR 0014 — Visual "Vivo": cor por área, fonte arredondada e cabeçalhos coloridos

## Status
Implementado. Substitui a parte visual da ADR 0011 (paleta, tipografia e forma dos
componentes); as regras de acessibilidade e de fluxo da ADR 0011 continuam valendo.
Só interface: nenhuma fórmula, ponto de corte ou classificação foi alterado (ADR 0009).

## Contexto
O visual anterior (verde-azulado, cartões com borda, títulos em sobrelinha, fonte do
sistema) foi considerado sem personalidade. Três direções foram desenhadas com o mesmo
conteúdo real (Início e IMC com resultado) e comparadas lado a lado: "Clínico"
(minimalista), "Vivo" (colorido e acolhedor) e "Editorial" (serifado, sóbrio). A
escolhida foi a **Vivo**.

## Decisões

### 1. Cor
A paleta é construída em **OKLCH**, um espaço de cor perceptualmente uniforme: luminosidade e saturação iguais ali parecem iguais ao olho, o que não acontece com hex ou HSL.

- **Âncora:** o verde-petróleo da marca, no matiz 172° (`primary`/`hero`).
- **Áreas em harmonia com a âncora:** consultório coral (42°), pediatria amarelo (82°), hospital e UTI azul (252°), exames violeta (298°). Os blocos têm a mesma luminosidade e o mesmo croma, então nenhuma área "grita" mais que outra.
- **Quatro versões por cor de área** (`areaColors`): texto e ícone, bloco cheio, fundo suave e texto sobre o bloco. O amarelo pede texto escuro (`onSun`).
- **Neutros puxados para o matiz da marca:** cinzas levemente esverdeados, não azulados, para o fundo e a marca não brigarem.
- **Cores de estado separadas das de área:** erro carmim (24°, mais vermelho que o coral), aviso âmbar (62°) e sucesso verde (148°, distinto do verde-petróleo da marca).
- **Tema escuro com paleta própria**, não a clara invertida:
  - fundo em tinta verde-petróleo profunda;
  - superfícies mais claras quanto mais "altas";
  - blocos de área menos saturados, porque cor saturada vibra sobre fundo escuro;
  - textos e ícones em tons claros da mesma família.
- **Contraste medido em teste** (`src/theme/__tests__/contrast.test.ts`), nos dois temas:
  - toda cor de texto passa AA (4,5:1) sobre o fundo, a superfície, a superfície alternativa e a própria versão suave;
  - o branco passa AA sobre o cabeçalho e os blocos.

  Os valores foram gerados ajustando a luminosidade de cada cor no OKLCH até atingir o contraste exigido, sem mudar matiz nem croma.

### 2. Tipografia
- Nunito (arredondada), embarcada no app: continua 100% offline.
- Cada peso é um arquivo, porque o Android não engrossa uma fonte própria por
  `fontWeight`. O `AppText` troca o peso pedido pela família certa (`fontFor`), então
  `style={{ fontWeight: '800' }}` continua funcionando.
- Títulos em Black/ExtraBold, corpo em Medium.
- Licença OFL-1.1, aceita só para fontes. O arquivo vai junto do app como obra separada
  (agregação), e o motivo está registrado em `scripts/lib/licenses.ts`.

### 3. Forma
- Raios maiores (cartões de 22, controles de 16) e sombras largas e suaves no tema
  claro. No escuro, a separação vem do tom da superfície.
- Cartões sem borda; seções com título em negrito forte, em vez de sobrelinha em caixa alta.
- Campos preenchidos (fundo suave, sem borda), com borda da marca no foco. Altura de 52,
  e controles pequenos com 44, o alvo de toque mínimo.
- Pílulas para escolhas (chips e controle segmentado em trilho).
- Avisos (`Callout`) com o ícone num círculo da própria cor, sem faixa lateral.

### 4. Estrutura das telas
- **Cabeçalho colorido** (`Screen` com `hero`), com cantos inferiores arredondados:
  - fica nas abas e nas telas de identidade forte (ficha do paciente, calculadora na cor
    da área, Sobre, boas-vindas);
  - o primeiro cartão pode flutuar sobre a borda (`overlap`);
  - enquanto a tela está em foco, os ícones da barra de status ficam claros;
  - em listas virtualizadas, o cabeçalho fica fixo.
- Telas de detalhe e formulários mantêm o cabeçalho simples: a cor marca os pontos de
  entrada, não cada tela.
- **Barra de abas flutuante** (`tabBar` próprio): um cartão arredondado acima da borda,
  com a aba ativa numa pílula. Fica no fluxo da tela, sem cobrir conteúdo.
- **Início**: cabeçalho com saudação, cartão flutuante do dia (atendimentos, tarefas e
  o próximo horário) e grade de áreas coloridas que leva direto à área na aba Calculadoras.
- **Calculadoras**: busca no cabeçalho, público em blocos cheios na cor da faixa e
  áreas em grade. A área escolhida abre os métodos por tema logo abaixo.
- **Resultado**: o valor principal fica num bloco no tom suave da classificação, com a
  classificação em pílula sólida (ícone mais texto, sem depender só da cor).

## Consequências
- Telas novas usam `Screen`, `Card`, `Section` e os tokens; cores só de `colors`,
  `areaColors` e `withAlpha`, nunca hex no componente (exceto o branco sobre blocos de cor).
- Uma cor nova de texto entra na lista do teste de contraste.
- Os PDFs (ficha e plano) usam as mesmas cores, em versão para impressão: verde da marca nos títulos e cinzas da paleta, com o rodapé em cinza AA.
- O ícone do app segue a paleta: fundo em gradiente verde-petróleo e folha do coral ao âmbar. Todos os formatos (`icon.svg`, `icon.png`, camadas do Android e favicon) saem de `node scripts/build-icons.mjs`.
