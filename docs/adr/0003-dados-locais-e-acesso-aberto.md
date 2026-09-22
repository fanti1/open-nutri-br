# ADR 0003 — Dados no aparelho, acesso aberto e fim do premium

## Status
Implementado. Substitui a parte de "sessões no servidor" do plano original e
revoga a marcação `is_premium` citada na ADR 0001.

## Contexto
Pedido do produto: todas as funcionalidades abertas a todos, com um "sistema
de fichas" (pacientes, atendimentos, cálculos, arquivos), checklist de tarefas
e agenda de atendimentos com lembretes. A pessoa escolheu guardar os dados
**no celular, com backup em arquivo** — em vez de conta obrigatória no servidor
ou integração direta com o Google Drive.

## Decisões

### 1. Dados clínicos ficam no aparelho (SQLite)
- `expo-sqlite` no celular; no navegador, o mesmo banco roda via wa-sqlite
  (OPFS). O app só usa a API assíncrona, que dispensa `SharedArrayBuffer` e,
  portanto, os cabeçalhos COOP/COEP.
- Todo acesso passa pela interface `SqlDatabase` (`mobile/src/data/db/types.ts`);
  os testes usam um adaptador sobre sql.js, sem mocks do Expo.
- Migrações versionadas por `PRAGMA user_version` (`migrations.ts`).
- Repositórios (uma tabela, uma responsabilidade) + serviços que coordenam
  efeitos colaterais (agenda/tarefas ↔ notificações, backup).
- Reatividade: cada escrita chama `notifyChange(tabela)`; `useLiveQuery`
  refaz a consulta das telas inscritas. A UI reflete qualquer alteração na hora,
  sem cache de servidor.

**Por quê:** dado de saúde de paciente fica sob controle do nutricionista
(controlador, LGPD), o app funciona offline e não há custo de servidor por
usuário. Login deixou de ser necessário.

### 2. Backup em arquivo, não sincronização
- `backupService` gera um JSON (`format: "opennutri-br-backup"`,
  `schema_version`) com todas as tabelas, inclusive anexos em base64.
- No celular o arquivo vai para a folha de compartilhamento do sistema
  (Drive, iCloud, e-mail, WhatsApp); no navegador é baixado.
- A restauração valida formato e versão (recusa backup de versão mais nova),
  roda numa transação e reagenda os lembretes.

**Alternativa descartada:** integração OAuth com Google Drive — exige
verificação do app pelo Google para escopos de Drive, não cobre iCloud e
acopla o app a um provedor. O compartilhamento do sistema já entrega o arquivo
em qualquer nuvem que a pessoa use.

### 3. Lembretes são notificações locais
`expo-notifications` agendadas no próprio aparelho, atrás da interface
`ReminderScheduler` (testável). Não precisam de servidor de push. No navegador
a agenda funciona, mas não toca.

### 4. Tudo aberto; premium removido
- Removidos `is_premium`, `plans`, `subscriptions` e os modelos
  correspondentes.
- Rotas de calculadoras e alimentos passaram a ser públicas, com
  `throttle:120,1`. Rotas de pacientes/sessões do servidor continuam
  autenticadas, mas o app atual não as usa.

### 5. Catálogo embarcado no app
`php artisan catalog:export` grava `mobile/src/data/catalog.json` a partir do
registry do backend (fonte única: `CalculatorCatalog`). O teste
`CatalogSnapshotTest` falha se o arquivo estiver desatualizado. Assim a lista
de calculadoras funciona offline.

## Consequências
- Calculadoras de fórmula pura rodam 100% offline. As curvas OMS
  (`server_only`) ainda precisam de internet: as tabelas LMS têm ~18 mil linhas
  e o cálculo continua no servidor, que recebe só as medidas, sem dados
  identificáveis do paciente.
- Perder o aparelho sem backup significa perder os dados — a tela de backup
  mostra a data do último backup.
- O resultado salvo na ficha é o calculado no aparelho (mesma engine validada
  pelos vetores de `shared/calculators-spec/`), não mais um recálculo do
  servidor.
