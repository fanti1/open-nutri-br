# ADR 0002 — Fase 3 (Pediatria): curvas OMS com dados e algoritmo oficiais

## Status
Implementado (12 calculadoras). Uma calculadora do catálogo deferida.

## Decisões

### Curvas de crescimento: dados oficiais, algoritmo replicado do código da OMS
As curvas OMS não são fórmulas — são tabelas de parâmetros LMS (~18 mil linhas).
Não reproduzimos nada de memória:
- As tabelas foram copiadas sem alteração dos pacotes oficiais da OMS
  (`anthro` para 0–5 anos, `anthroplus` para 5–19 anos) — ver
  `backend/database/data/who/README.md`.
- O algoritmo foi portado lendo o código-fonte desses pacotes: escore-Z
  restrito acima de ±3 DP nos indicadores de peso, correção de ±0,7 cm entre
  comprimento (deitado) e estatura (em pé), idade em dias arredondada para
  cima, interpolação linear por mês (2007) e por 0,1 cm (peso/comprimento).
- **Gabarito dos testes vem da própria OMS**: o caso do teste oficial do
  pacote `anthro` (987 dias, 72,86 cm deitado → z = −6,09) e linhas do
  arquivo `survey_who2007_z.csv`, com escores calculados pela OMS — incluindo
  extremos (4,21 e −3,24) que exercitam o z restrito. Os demais casos 0–5
  anos foram calculados por uma implementação independente (awk) que
  reproduz o −6,09 oficial.

Indicadores: peso/idade, comprimento/idade, peso/comprimento-estatura,
IMC/idade e perímetro cefálico (0–5 anos, OMS 2006); IMC/idade,
estatura/idade (5–19) e peso/idade (5–10, limite publicado pela OMS) (OMS 2007).

### Classificação: Norma Técnica do SISVAN (Ministério da Saúde, 2011)
Público brasileiro → pontos de corte do SISVAN, que adota os padrões OMS.
Perímetro cefálico: microcefalia < −2 DP / grave < −3 DP (OMS, 2016).

### Calculadas só no servidor
As 10 calculadoras baseadas nas tabelas OMS (inclui Gomez e Waterlow, que
usam as medianas OMS) rodam apenas no backend — embarcar as tabelas no app
duplicaria dados de referência que precisam ficar idênticos. Os specs
compartilhados marcam `"server_only": true` e o teste do mobile garante
que elas **não** têm implementação local. Schofield e a necessidade
energética FAO são fórmulas puras e têm espelho TypeScript como as demais.

### Gomez e Waterlow com medianas OMS
Os autores originais usavam as referências de suas épocas; usamos as
medianas dos Padrões OMS 2006, que é a prática atual. O app calcula a
mediana automaticamente em vez de pedir ao nutricionista que a consulte.

### Schofield e necessidade energética — verificados na fonte primária
Coeficientes de Schofield conferidos na Tabela 5.2 de FAO/WHO/UNU, *Human
Energy Requirements* (2004) — todas as faixas etárias, por isso a
calculadora vale para criança, adulto e idoso. Necessidade energética de
1–18 anos pelas Tabelas 4.5/4.6 do mesmo relatório (kcal/kg/dia por sexo,
idade e atividade).

## Deferido
- **Necessidades proteicas por idade (DRI/IOM)** — a fonte primária (NCBI
  Bookshelf) bloqueou o acesso automatizado (reCAPTCHA) e não conseguimos
  verificar os valores. Pela mesma regra da ADR 0001, não implementamos de memória.
- **Necessidade energética < 1 ano** (Tabela 3.3 da FAO) — a extração da
  tabela veio incompleta; implementar após conferência manual da tabela.
