# ADR 0008 — Plano alimentar / recordatório 24 h e segurança dos dados

## Status
Implementado. Segue as ADRs 0003 (dados no aparelho) e 0006 (100% offline).

## Contexto
Próximos passos do produto: montar **plano alimentar** e **recordatório 24 h**
com a TACO que já está no aparelho, e proteger os dados dos pacientes com
**bloqueio do app (PIN/digital)** e **backup com senha**. Tudo precisa
continuar funcionando sem internet e sem servidor.

## Decisões

### 1. Plano alimentar e recordatório 24 h
- Uma estrutura só para os dois (`meal_plans.kind = plano | recordatorio`),
  com itens por refeição (`meal_plan_items`: alimento da TACO, gramas, medida
  caseira opcional). Migração 2 do SQLite; `ON DELETE CASCADE` a partir do
  paciente e do plano. Um plano pode existir sem paciente (modelo reutilizável).
- O item guarda o **id da TACO e o nome**, não os nutrientes: os totais são
  sempre recalculados da tabela embutida, e o nome continua legível mesmo se o
  id deixar de existir numa atualização futura da TACO.
- Seis refeições fixas (café da manhã, lanche da manhã, almoço, lanche da
  tarde, jantar, ceia), a divisão mais usada na prática clínica brasileira.
- Totais (`src/domain/nutrition.ts`) seguem a legenda oficial da TACO:
  `Tr` (traço) e `NA` (não aplicável) contam como 0; `*` (em reavaliação) e
  célula vazia (não analisado) deixam o total **incompleto**, e o app avisa que
  o valor mostrado é um mínimo, em vez de somar zero em silêncio.
- Distribuição de macronutrientes pelos fatores de Atwater (4/4/9 kcal/g);
  proteína em g/kg usa o último peso registrado na ficha.
- A meta de energia pode vir do último VCT/GET salvo na ficha. Os campos de
  meta e observações salvam enquanto a pessoa digita (debounce de 600 ms) e ao
  sair da tela, então nada se perde se ela voltar sem tirar o foco do campo.
- PDF do plano gerado no aparelho (mesma infraestrutura do relatório da ficha).

### 2. Bloqueio do app
- PIN de 4 a 6 dígitos. O app guarda só `PBKDF2-SHA256(PIN, sal aleatório)`,
  comparado em tempo constante; o PIN nunca é gravado. O número de iterações
  (10.000) fica gravado junto do hash, para poder mudar sem invalidar PINs já
  criados.
- **O que segura o PIN contra tentativa e erro é a espera, não o hash.** Com
  10^4–10^6 combinações, nenhuma quantidade de iterações impede a força bruta
  de quem já tem o arquivo do banco, e esse arquivo, no sandbox do app, tem os
  próprios dados. Por isso as iterações são moderadas: com 100.000 em JS puro,
  o desbloqueio levava segundos no Android. Depois de 5 erros seguidos o teclado
  espera 30 s, e a espera dobra a cada 5 novos erros, até 15 min. A contagem
  fica gravada, então fechar e reabrir o app não a zera.
- Enquanto o app está bloqueado, o conteúdo por baixo fica oculto para leitores
  de tela e serviços de acessibilidade (`importantForAccessibility =
  no-hide-descendants` / `aria-hidden`). Sem isso, o TalkBack leria as fichas
  "atrás" da tela de bloqueio.
- Digital/rosto via `expo-local-authentication`, sempre com o PIN como
  alternativa.
- O app tranca ao abrir e ao voltar do segundo plano depois de 1, 5 ou 15
  minutos (configurável). Ativar o PIN não tranca na hora.
- A configuração do bloqueio é **só do aparelho**: não vai no backup e é
  preservada ao restaurar. Assim, quem esqueceu o PIN reinstala o app e
  restaura o backup, e um backup não instala o PIN de outro aparelho.
- Limitação conhecida: o bloqueio protege a interface, não cifra o banco
  SQLite. A proteção do arquivo fica com o sandbox do Android/iOS e com a
  criptografia de disco do próprio sistema.

### 3. Backup com senha
- Opcional, e marcado por padrão na tela de backup. O JSON do backup é cifrado
  com AES-256-GCM, com chave de `PBKDF2-SHA256(senha, sal de 16 bytes,
  200.000 iterações)` e IV de 12 bytes, ambos aleatórios a cada backup
  (`expo-crypto`).
- Formato próprio (`opennutri-br-backup-cifrado`, versão 1) que registra o KDF,
  as iterações, o sal e o IV, para poder mudar parâmetros no futuro sem perder
  a leitura dos backups antigos.
- Criptografia em JS puro (`@noble/hashes`, `@noble/ciphers`, auditadas), para
  funcionar igual no Android, no iOS e no navegador sem módulo nativo. A senha
  é normalizada em NFC, para que "ç" e "ã" digitados em teclados diferentes
  gerem a mesma chave.
- Senha errada ou arquivo alterado resultam na mesma mensagem: a tag do GCM não
  confere. Não existe recuperação de senha, por construção.
- A restauração detecta sozinha se o arquivo é protegido e só então pede a
  senha. Backups antigos, sem senha, continuam sendo lidos.

## Verificação
- Jest: repositório de planos, totais e legenda da TACO, PDF, criptografia (ida
  e volta, senha errada, adulteração, parâmetros gravados) e bloqueio (hash,
  tempo de bloqueio, PIN fora do backup).
- E2E web (Playwright): montar o plano (arroz integral 150 g + feijão carioca
  100 g = 262 kcal), editar a quantidade, criar o recordatório, bloquear e
  desbloquear com PIN, gerar o backup cifrado (sem nenhum texto legível) e
  restaurá-lo: a senha errada é recusada, a certa restaura e o PIN do aparelho
  é mantido.
- E2E nativo (Maestro, emulador Android): no APK, plano com a TACO, meta
  mantida ao voltar sem tirar o foco, PIN ao reabrir (errado recusado, certo
  libera) e backup protegido abrindo o compartilhar do Android (Drive).

## Problemas achados só no aparelho (e corrigidos)
- Com a tela de ponta a ponta (edge-to-edge) do Android, o sistema não
  redimensiona mais a janela quando o teclado abre. Nos painéis (`Sheet`), o
  teclado cobria o painel inteiro: a busca da TACO era digitada às cegas. Agora
  painéis e telas usam `KeyboardAvoidingView` com `padding` também no Android.
- Campos com valor sugerido (quantidade "100 g") somavam dígitos em vez de
  substituir ("100" + "150" = "100150"). Agora o valor é selecionado ao tocar.
- O teste nativo tocou em números da tela de Início *por baixo* do bloqueio:
  eles continuavam na árvore de acessibilidade (ver decisão 2). Na mesma
  revisão, o teclado do PIN passou a guardar o valor mais recente no próprio
  toque, porque toques mais rápidos que o redesenho da tela podiam partir do
  valor antigo e perder um dígito.
