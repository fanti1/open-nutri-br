# ADR 0007 — Calculadoras organizadas por público (criança, adulto, idoso)

## Status
Implementado. Substitui o filtro "Todas as idades / Adulto / Idoso" que ficava
dentro de cada área.

## Contexto
A faixa etária aparecia como filtro secundário dentro das áreas e como
etiquetas "Adulto · Idoso" em quase todas as linhas. Na prática, "Idoso" era um
adulto com etiqueta a mais: 40 dos 42 métodos de adulto também valiam para
idoso, e nenhum resultado mudava por ser idoso. O pedido do produto: idoso é uma
categoria separada, e a separação precisa ficar clara.

## Decisões

### 1. O público é a primeira escolha
A aba Calculadoras começa por "Para quem é o cálculo?" — Criança (0–19),
Adulto (20–59) ou Idoso (60+), mesmos cortes do resto do app (OMS até 19 anos;
Estatuto do Idoso a partir de 60). A escolha fica guardada
(`settings.calculator_audience`). Abaixo aparecem só os métodos validados para
esse público, por área (abre e fecha) e, dentro dela, por tema. A busca continua
cobrindo todos os públicos e mostra as faixas de cada resultado.

### 2. A faixa acompanha a calculadora
Aberta a partir do público, a calculadora já entra com a faixa marcada
(`?faixa=`); na primeira vez só falta o sexo. O perfil continua guardado por
calculadora (ADR 0003/redesenho): abrir o mesmo método em outro público troca a
faixa e mantém o sexo.

### 3. Selo só quando informa
"Específico para idosos/adultos/crianças" aparece apenas quando o tema mistura
métodos exclusivos da faixa com gerais (ex.: IMC do Idoso dentro de
Antropometria). Num tema todo pediátrico o selo seria repetição.

### 4. IMC do idoso com os cortes do SISVAN
Novo método `imc-idoso` (60+): IMC ≤ 22,0 baixo peso; > 22,0 e < 27,0 peso
adequado; ≥ 27,0 sobrepeso — pontos de corte de Lipschitz (1994) adotados pelo
Ministério da Saúde no SISVAN, conferidos na página oficial do SISVAN/DATASUS
(tabnet.datasus.gov.br/cgi/SISVAN/CNV/notas_sisvan.html). O IMC da OMS
(`imc`) passa a valer só para adultos (20–59), como no SISVAN. Mesma conta,
interpretação diferente: IMC 25 é sobrepeso no adulto e peso adequado no idoso.

### 5. Schofield em Consultório → Metabolismo
As equações de Schofield cobrem de 0 a 60+ anos (base FAO/OMS/UNU). Estavam na
área Pediatria, que por isso aparecia com 1 método para adultos e idosos. Agora
ficam em Consultório → Metabolismo, visíveis para os três públicos; a área
Pediatria só aparece para crianças.

## Resultado
Criança: 15 métodos (Pediatria + gerais) · Adulto: 42 · Idoso: 40, com IMC do
Idoso e MNA-SF como específicos.
