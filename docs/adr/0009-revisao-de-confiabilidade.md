# ADR 0009 — Revisão de confiabilidade dos cálculos, desempenho e limpeza

## Status
Implementado. Nenhuma regra de negócio mudou: fórmulas, coeficientes, pontos
de corte e textos clínicos são os mesmos. O que mudou foi o caminho até eles
(formulário, arredondamento, comparação com os cortes) e a robustez em volta.

## Como foi verificado
- **Teste diferencial PHP × TypeScript**: cerca de 450 mil entradas válidas,
  geradas a partir dos esquemas do catálogo — aleatórias (incluindo mínimos e
  máximos de cada campo) e em grade densa perto dos pontos de corte (IMC,
  MUST, Penn State, RCQ, RCE). Depois das correções: **nenhuma divergência**
  de valor ou classificação entre o backend e o app. Os únicos erros são os
  avisos esperados de medida fora da faixa das curvas da OMS, iguais nos dois.
- **Vetores pelo caminho da tela**: cada caso de `shared/calculators-spec/`
  agora também é digitado no formulário gerado do catálogo (texto, vírgula
  decimal, opções tocadas) antes de calcular. Esse teste falha no código
  anterior (MNA-SF, abaixo).
- **Teste de fumaça no app web** (Playwright): onboarding, MNA-SF de um idoso
  desnutrido pela interface, sem erros no console e sem requisição externa.

## Problemas encontrados e corrigidos

### Cálculo
1. **MNA-SF classificava desnutrido como normal (crítico).** O item D
   (`integer|in:0,2`) é uma lista de opções; o valor tocado chegava à fórmula
   como texto e a soma virava concatenação: 0+0+0+"2"+0+0 = "0200" →
   "estado nutricional normal", quando o certo é 2 → "desnutrido". Agora
   opções numéricas vão como número (`FieldDescriptor.numeric`).
2. **Faixas `between:` eram ignoradas no app.** O formulário só lia `min:` e
   `max:`: aceitava NRS-2002 com escore 9 (máximo 3), itens do MNA-SF fora da
   escala e 90% de carboidrato na distribuição de macros. Agora `between:a,b`
   vale como `min`/`max`, igual ao backend. Um teste falha se o catálogo usar
   uma regra de validação que o app não sabe aplicar.
3. **Números "soltos".** `Number()` aceitava "0x46" (70 kg), "1e2" e
   "Infinity". O formulário, as medidas do atendimento, as gramas do plano e a
   meta de energia usam um leitor decimal estrito (`parseDecimal`).
4. **Arredondamento diferente do backend.** `Math.round(x * 100) / 100` não
   arredonda como o `round()` do PHP em empates (20,275 → 20,27 em vez de
   20,28) nem em negativos (−62,125 → −62,12 em vez de −62,13). Com peso de 1
   casa e altura de 2, isso mudava o IMC em 0,01 em cerca de 1 a cada 1.500
   casos; num empate exatamente no corte (ex.: 99,98 kg / 2,00 m = 24,995) o
   app dizia "eutrofia" e o backend "sobrepeso". `round2`/`round4` agora são um
   porte fiel de `_php_math_round` (PHP 8.4, `ext/standard/math.c`).
5. **Ruído de ponto flutuante decidindo corte calculado.** 76,8 kg / 1,60 m²
   dá 29,999999999999993 no computador: o Penn State aplicava a versão 2003b a
   um idoso com IMC 30 exato (a regra manda a 2010), e o MUST dava 2 pontos a
   um IMC 18,5 exato (47,36 kg / 1,60 m²), quando o certo é 1. Esses cortes
   passam a ser comparados com tolerância de 1e-9 (`Cutoff::reaches` /
   `reaches()`), muito abaixo da precisão de qualquer medida — nenhum corte
   muda. Os dois casos viraram vetores em `shared/calculators-spec/`.
6. **Penn State: rótulo e valor de versões diferentes.** A fórmula escolhia a
   versão com o IMC sem arredondar e o classificador com o IMC arredondado: com
   IMC 29,997 o valor era da 2003b e o rótulo dizia 2010. Os dois usam o mesmo
   IMC agora.
7. **Idade fracionada do auto-preenchimento.** Os anos com decimais (anemia e
   ferritina da OMS) eram arredondados e "faziam aniversário" até 2 dias antes:
   na véspera dos 5 anos a criança recebia o corte de 5–11 anos. Agora a idade
   é truncada (`ageInYearsDecimal`: 4,99 na véspera, 5,00 no dia).
8. **Guarda de saída.** Nenhuma fórmula consegue exibir ou salvar um resultado
   que não seja número finito: `makeCalculator` recusa com `InvalidResultError`,
   cuja mensagem aparece no lugar do resultado.
9. **Testes de vetores exigiam pouco.** A tolerância era 0,05 no Jest e 0,01 no
   PHPUnit (aceitaria erro na segunda casa). Agora os valores têm de bater
   exatamente (1e-6).

### Dados e robustez
- **Medida digitada errado no atendimento sumia em silêncio** (e é ela que
  preenche as calculadoras). Agora o campo mostra o erro e o salvamento espera.
- **Restauração de backup**: os nomes de coluna vinham do arquivo direto para o
  SQL. Agora só entram colunas que a tabela tem (`PRAGMA table_info`) e a
  estrutura é validada antes (arquivo corrompido tem mensagem própria).
- **Migração** que falhasse deixava a transação aberta: agora faz `ROLLBACK`.
- **Excluir paciente** não atualizava as telas de planos alimentares (que saem
  junto, em cascata).
- `update()` de planos e itens só aceita colunas de uma lista fixa.
- **Falha ao abrir o banco**: tela "Algo deu errado" com "Tentar de novo"
  (ErrorBoundary do expo-router), em vez de o app fechar; a tentativa
  seguinte abre o banco de novo em vez de reaproveitar a falha.
- **Arquivos compartilhados** (backup e anexos) ficam numa pasta temporária
  esvaziada a cada novo envio: cópias completas dos dados não se acumulam no
  cache do aparelho (LGPD, minimização).

### Desempenho
- TACO indexada por id (`Map`) e com os nomes já normalizados para a busca —
  antes, cada item do plano fazia busca linear e cada tecla normalizava os 597
  nomes.
- Contadores da ficha com uma consulta `COUNT(*)`, em vez de carregar (e
  converter de JSON) todas as listas do paciente.
- Últimas medidas do paciente em uma consulta, em vez de cinco.
- Tema com objeto estável: o app não é redesenhado inteiro a cada mudança de
  configuração.

### Limpeza
- Removidos: capturas de tela de referência (`references/`), a página
  `welcome` do Laravel, Vite/Tailwind/`package.json` do backend (não usados —
  o backend é só API), o comando de exemplo `inspire`, o README padrão do
  Laravel e `splash-icon.png` (sobra do template do Expo, sem uso).
- Novo ícone do app (anel aberto — "Open" — com cabinho e folha — "Nutri" —,
  nas cores da marca), com camadas do ícone adaptativo e monocromático do
  Android e favicon. Fonte vetorial: `mobile/assets/icon.svg`.

## Pendências científicas
Tratadas na [ADR 0010](0010-auditoria-cientifica.md): cada método passou por
auditoria na fonte, com o resultado publicado em [docs/METODOS.md](../METODOS.md)
e no app.

## Pendências de produto (LGPD)
- Excluir a ficha mantém compromissos e tarefas do paciente, só sem o vínculo
  (`ON DELETE SET NULL`) — e o título padrão do compromisso é "Atendimento —
  {nome}". Para a eliminação ser completa, avaliar apagar ou anonimizar esses
  registros junto com a ficha (hoje o README orienta a apagá-los à mão).
- O lembrete de backup some ao abrir a tela de compartilhar, mesmo que a pessoa
  cancele: o sistema não informa se o arquivo foi de fato salvo.
