# ADR 0012 — Desempenho: React Compiler, consultas compartilhadas e listas virtualizadas

## Status
Implementado. Só infraestrutura de interface e dados; nenhuma fórmula, ponto de
corte ou classificação foi alterado (ADR 0009).

## Contexto
Revisão de desempenho do app (tudo local: SQLite no aparelho, TACO e curvas da
OMS embarcadas). O que já estava bem resolvido e foi mantido:

- TACO e curvas da OMS carregadas sob demanda (`require` dentro da função) e
  indexadas uma vez; contagens da ficha feitas no banco; tema com dois objetos
  fixos no contexto; cálculo em `useMemo` a cada tecla.

Gargalos encontrados:

- **Configurações consultadas em dobro**: cada componente com `useSettings()`
  fazia a própria consulta. Tema, bloqueio, primeiro acesso, a tela aberta e
  as abas montadas por baixo liam a mesma tabela, cada um por si — e qualquer
  mudança de preferência repetia todas.
- **Tema piscando**: as preferências só chegavam depois da primeira tela, que
  aparecia no tema claro e trocava para o escuro.
- **Lista de pacientes sem virtualização**: todas as fichas desenhadas de uma
  vez numa `ScrollView` — com centenas de pacientes, a aba demorava a abrir.
- **Seletor de paciente** consultava a lista inteira ao abrir qualquer
  calculadora ou formulário, mesmo fechado.
- **Duplicar plano alimentar**: três idas ao banco e um aviso de mudança por
  alimento — com 40 alimentos, ~120 comandos e 40 recargas de todas as telas.
- **SQLite sem WAL**: leituras esperavam gravações.
- Nenhuma memoização automática: componentes redesenhavam a cada mudança do pai.

## Decisões

1. **React Compiler** (`experiments.reactCompiler` em `app.json`): memoiza
   componentes e hooks em tempo de build. O lint passou a aplicar as regras do
   compilador (`eslint-plugin-react-hooks`, `recommended-latest`) — código que
   as quebre deixa de ser otimizado, e o lint avisa.
2. **Consultas compartilhadas** (`src/data/sharedQuery.ts`): configurações e
   favoritos são uma consulta só para o app inteiro (`useSyncExternalStore`),
   refeita uma vez por mudança. O `DataProvider` as carrega antes da primeira
   tela: tema certo desde o início e nada de "carregando" nas calculadoras.
3. **`useLiveQuery(..., enabled)`**: consulta parada enquanto não é necessária
   (seletor de paciente fechado), mantendo o último resultado.
4. **Lista de pacientes em `FlatList`**: só as linhas visíveis são desenhadas;
   `PatientRow` com `memo` e `onPress(id)` estável. `Screen` com
   `scroll={false}` entrega a área inteira para listas virtualizadas.
5. **Buscas com `useDeferredValue`** (pacientes, TACO, calculadoras): o campo
   responde a cada tecla e a lista atualiza logo em seguida. O texto de busca
   do catálogo é normalizado uma vez só.
6. **Seletor de paciente** desenha no máximo 50 linhas e pede para digitar o
   nome para achar as outras.
7. **Duplicar plano** num `INSERT` em lote (100 linhas por comando) com um único
   aviso; a numeração por refeição é a mesma que `addItem()` daria.
8. **SQLite em WAL** no aparelho (`PRAGMA journal_mode = WAL`). `synchronous`
   continua no padrão (FULL): dado clínico não troca durabilidade por velocidade.

## Consequências
- O bundle web cresce ~3% (código de memoização do compilador); o ganho é em
  redesenhos evitados.
- Novas preferências globais devem usar `settingsQuery`; consultas com
  parâmetro continuam em `useLiveQuery`.
- Listas que podem crescer sem limite (pacientes) usam `FlatList`; listas
  curtas e limitadas (grupos da TACO, 60 resultados) seguem com `map`.
- Testes: `sharedQuery.test.ts` (uma consulta por mudança, resultado mais
  novo vence, erro mantém o último valor) e duplicação em lote em
  `dataLayer.test.ts`.
