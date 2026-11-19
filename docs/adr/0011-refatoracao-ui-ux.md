# ADR 0011 — Refatoração de UI/UX: sistema de design e fluxo da calculadora

## Status
Implementado. A parte visual (paleta, tipografia, forma dos componentes) foi substituída
pela ADR 0014; as regras de acessibilidade e de fluxo continuam valendo. Só camada de interface (`mobile/src/ui`, `mobile/src/theme`,
telas em `mobile/app` e componentes de `mobile/src/features`). Nenhuma fórmula,
ponto de corte ou classificação foi alterado (ADR 0009).

## Contexto
O app já tinha um kit de componentes próprio, mas a revisão visual (capturas no
navegador, tema claro e escuro, 390 pt e 1280 pt de largura) mostrou:

- O resultado da calculadora aparecia só abaixo do formulário; em métodos com
  muitos campos era preciso rolar para ver se o cálculo já tinha saído.
- Campo preenchido com valor fora da faixa (ex.: altura "165" em metros) gerava
  "Falta preencher: Altura", em vez de pedir correção.
- Primeira vez numa calculadora: um bloco de texto e um toque a mais
  ("Usar este perfil") mesmo com faixa e sexo já escolhidos.
- Textos com contraste abaixo de 4,5:1 (WCAG AA): `textSubtle` (2,9:1),
  aviso (3,6:1), sucesso (3,9:1), cor de criança (3,2:1).
- Campos de texto sem estado de foco; alvos de toque menores que 44 pt.
- Atalhos do Início cortados ("Novo pacie…"); estado vazio de Pacientes com
  dois botões "Novo paciente".
- No navegador/tablet o conteúdo esticava de ponta a ponta.
- Avisos (backup, auditoria, faixa etária) montados à mão, cada um de um jeito.

## Decisões

### 1. Fundamentos (tokens)
- Paleta clara recalibrada: toda cor usada como texto passa em AA sobre fundo,
  superfície e a própria versão "Soft". Valores medidos, não estimados.
- Novos tokens: `surfacePressed` (toque), `borderStrong` (foco), `layout`
  (`minTouch` 44, altura de controle 48/40, largura máxima 720) e
  `elevation(nível, escuro)` — sombras só no tema claro.
- Tipografia com `lineHeight` em todas as variantes, nova variante `label`
  (rótulo de campo) e algarismos tabulares nos valores de resultado.
- `withAlpha(cor, alfa)` substitui a concatenação `${cor}1F` nos componentes.

### 2. Componentes
- Novos: `IconButton` (ações de cabeçalho com 44 pt e rótulo acessível) e
  `Callout` (aviso único com tons info/sucesso/aviso/perigo/neutro).
- `TextField`: anel de foco, ícone de erro, botão de limpar (`clearable`) nas
  buscas, erro anunciado ao leitor de tela.
- `ChipGroup`: ✓ na opção escolhida (seleção não depende só da cor), papel de
  rádio; `Segmented` com altura mínima e destaque elevado.
- `Button`, `ListItem`, `Checkbox`, `Fab`: alturas mínimas e estado pressionado.
- `Screen`: coluna centralizada (720) no navegador/tablet, cabeçalho como
  `header` para leitores de tela, rodapé fixo alinhado à coluna.
- `Sheet` com botão de fechar; `Toast` como `alert` com região viva.
- `AppText` limita o crescimento de títulos com a fonte do sistema.

### 3. Fluxos
- Calculadora: barra fixa no rodapé com o valor principal, a classificação e
  "Salvar"; antes do resultado, ela diz o que falta ou pede correção. Contador
  "N de M obrigatórios" no cartão de dados. Classificação com ícone além da cor.
- Perfil da calculadora: na primeira vez, escolher faixa e sexo já salva.
  "Alterar" continua com Cancelar/Salvar.
- Início: quatro atalhos em bloco (ícone sobre o rótulo); aviso de backup como
  `Callout`; pacientes recentes com a linha compartilhada `PatientRow`.
- Pacientes: lista agrupada num cartão; sem fichas, só o botão do estado vazio.
- Ficha: menu "Mais opções" como `IconButton`; "Sem medidas" como `Callout`.

## Consequências
- Telas novas devem usar `Callout` para avisos e `IconButton` para ícones
  tocáveis, e tirar cores de `colors`/`withAlpha` (nada de hex no componente).
- (Substituído pela ADR 0014: PDFs e ícone seguem a paleta nova.) Os relatórios em PDF e o ícone do app mantinham o verde anterior (#0B7A69);
  a diferença para o novo `primary` (#0A7363) é imperceptível.
- A aba "Calculadoras" ainda pode aparecer com reticências em telas de 360 pt
  com fontes largas; o espaçamento foi apertado, mas o nome não foi trocado.
- (ADR 0013) Um tocável não fica dentro de outro: caixa de seleção e linha, ou
  estrela e linha, são alvos irmãos. Linhas que abrem fora do app usam
  `ListItem` com `external`.
