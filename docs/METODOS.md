# Métodos e auditoria científica

> Arquivo gerado por `php artisan catalog:export` a partir de `shared/auditoria/*.json` — não edite à mão.

Cada calculadora do OpenNutri BR tem aqui a fórmula e os pontos de corte que o app usa, as fontes em que foram conferidos (com o grau de acesso a cada uma), as ressalvas, as mudanças e um exemplo resolvido. O mesmo conteúdo aparece no app, em "Sobre o método e referência". O exemplo de cada método é um caso de `shared/calculators-spec/`, verificado a cada teste pelas duas implementações (PHP e TypeScript).

## Como ler

| Situação | Significado |
|---|---|
| Conferido na fonte | Todos os coeficientes e pontos de corte foram conferidos em fonte primária ou documento oficial. |
| Conferido, com ressalvas | Conferido, mas parte depende de resumo ou de reprodução em artigo aberto, ou a própria fonte tem ambiguidade (descrita nas ressalvas). |
| Conferência pendente | Algum parâmetro ainda não pôde ser conferido na fonte (texto fechado ou indisponível). Nada foi alterado de memória. |
| Divergência encontrada | O método do app não corresponde à fonte citada ou à diretriz vigente. Aguarda decisão; o problema está descrito. |

Grau de acesso a cada fonte: texto completo da fonte · documento oficial · resumo da fonte (PubMed) · reprodução em artigo aberto · fonte não acessada.

**Encontrou algo diferente da fonte?** Abra uma issue com o modelo "Divergência científica", informando o método, a fonte (com página ou tabela) e o valor esperado.

## Resumo

55 métodos — Conferido na fonte: 31 · Conferido, com ressalvas: 19 · Conferência pendente: 5 · Divergência encontrada: 0.

| Método | Área | Público | Versão | Situação |
|---|---|---|---|---|
| [IMC](#imc) | Consultório | A | v1 | Conferido na fonte |
| [IMC do Idoso](#imc-idoso) | Consultório | I | v1 | Conferido na fonte |
| [Peso Ideal](#peso-ideal) | Consultório | A, I | v1 | Conferido, com ressalvas |
| [Perda de Peso %](#perda-de-peso) | Consultório | A, I | v1 | Conferência pendente |
| [Cintura-Quadril](#cintura-quadril) | Consultório | A, I | v2 | Conferido, com ressalvas |
| [Cintura-Estatura](#relacao-cintura-estatura) | Consultório | A, I | v2 | Conferido na fonte |
| [Índice de Conicidade](#indice-conicidade) | Consultório | A, I | v1 | Conferido na fonte |
| [Gordura Corporal %](#gordura-corporal) | Consultório | A, I | v1 | Conferido na fonte |
| [Jackson-Pollock (3 dobras)](#jackson-pollock-3) | Consultório | A | v1 | Conferido, com ressalvas |
| [Jackson-Pollock (7 dobras)](#jackson-pollock-7) | Consultório | A | v1 | Conferido, com ressalvas |
| [Durnin-Womersley](#durnin-womersley) | Consultório | A, I | v1 | Conferido, com ressalvas |
| [Harris-Benedict](#harris-benedict) | Consultório | A, I | v1 | Conferido, com ressalvas |
| [Mifflin-St Jeor](#mifflin-st-jeor) | Consultório | A, I | v1 | Conferido na fonte |
| [Schofield](#schofield) | Consultório | C, A, I | v1 | Conferido na fonte |
| [Cunningham](#cunningham) | Consultório | A | v1 | Conferido na fonte |
| [Fórmula de Bolso](#formula-de-bolso) | Consultório | A, I | v1 | Conferido, com ressalvas |
| [Valor Calórico Total](#valor-calorico-total) | Consultório | A, I | v2 | Conferido na fonte |
| [Distribuição de Macros](#distribuicao-macros) | Consultório | A, I | v1 | Conferido, com ressalvas |
| [Necessidades Proteicas](#necessidades-proteicas) | Consultório | A, I | v2 | Conferido na fonte |
| [Ingestão de Líquidos](#ingestao-liquidos) | Consultório | A, I | v2 | Conferido na fonte |
| [NRS-2002](#nrs-2002) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido, com ressalvas |
| [MUST](#must) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido na fonte |
| [MNA-SF](#mna-sf) | Hospitalar e Terapia Intensiva | I | v1 | Conferido na fonte |
| [ASG (Detsky)](#asg-detsky) | Hospitalar e Terapia Intensiva | A, I | v2 | Conferido, com ressalvas |
| [PG-SGA SF](#pg-sga-sf) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferência pendente |
| [GLIM](#glim) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido na fonte |
| [CONUT](#conut) | Hospitalar e Terapia Intensiva | A, I | v2 | Conferido na fonte |
| [PNI](#pni) | Hospitalar e Terapia Intensiva | A, I | v2 | Conferência pendente |
| [mNUTRIC](#mnutric) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido, com ressalvas |
| [Penn State](#penn-state) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido na fonte |
| [Swinamer](#swinamer) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido na fonte |
| [Curreri (Queimados)](#curreri) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido, com ressalvas |
| [Toronto (Queimados)](#toronto) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido na fonte |
| [Balanço Nitrogenado](#balanco-nitrogenado) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido, com ressalvas |
| [Holliday-Segar](#holliday-segar) | Hospitalar e Terapia Intensiva | C, A, I | v1 | Conferido, com ressalvas |
| [Nutrição Parenteral](#nutricao-parenteral) | Hospitalar e Terapia Intensiva | A, I | v2 | Conferido, com ressalvas |
| [Dieta Enteral](#dieta-enteral) | Hospitalar e Terapia Intensiva | A, I | v1 | Conferido na fonte |
| [Peso/Idade (OMS)](#oms-peso-idade-0-5) | Pediatria | C | v1 | Conferido na fonte |
| [Comprimento/Idade (OMS)](#oms-comprimento-idade-0-5) | Pediatria | C | v1 | Conferido na fonte |
| [Peso/Comprimento (OMS)](#oms-peso-comprimento-0-5) | Pediatria | C | v1 | Conferido na fonte |
| [IMC/Idade (OMS 0–5)](#oms-imc-idade-0-5) | Pediatria | C | v1 | Conferido na fonte |
| [Perímetro Cefálico (OMS)](#oms-perimetro-cefalico-0-5) | Pediatria | C | v1 | Conferido, com ressalvas |
| [IMC/Idade (OMS 5–19)](#oms-imc-idade-5-19) | Pediatria | C | v1 | Conferido na fonte |
| [Estatura/Idade (OMS 5–19)](#oms-estatura-idade-5-19) | Pediatria | C | v1 | Conferido na fonte |
| [Peso/Idade (OMS 5–10)](#oms-peso-idade-5-10) | Pediatria | C | v1 | Conferido na fonte |
| [Gomez](#gomez) | Pediatria | C | v1 | Conferência pendente |
| [Waterlow](#waterlow) | Pediatria | C | v1 | Conferência pendente |
| [Necessidade Energética Infantil](#necessidade-energetica-infantil) | Pediatria | C | v1 | Conferido na fonte |
| [Anemia (OMS)](#anemia-oms) | Exames laboratoriais | C, A, I | v2 | Conferido na fonte |
| [Ferritina (OMS)](#ferritina-oms) | Exames laboratoriais | C, A, I | v1 | Conferido na fonte |
| [Diagnóstico Glicêmico](#glicemia-diagnostico) | Exames laboratoriais | A, I | v1 | Conferido na fonte |
| [HOMA-IR](#homa-ir) | Exames laboratoriais | A, I | v1 | Conferido, com ressalvas |
| [Perfil Lipídico](#perfil-lipidico) | Exames laboratoriais | A, I | v2 | Conferido, com ressalvas |
| [CKD-EPI 2021](#ckd-epi-2021) | Exames laboratoriais | A, I | v1 | Conferido na fonte |
| [Cockcroft-Gault](#cockcroft-gault) | Exames laboratoriais | A, I | v1 | Conferido, com ressalvas |

Público: C criança/adolescente · A adulto · I idoso.

<a id="imc"></a>

## IMC

`imc` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Pontos de corte conferidos na Tabela 2.1 da OMS (TRS 894), nas notas oficiais do SISVAN e na NICE NG246.

**Fórmula e pontos de corte:** IMC = peso (kg) / altura (m)². < 18,5 baixo peso · 18,5–24,99 eutrofia · 25,0–29,99 sobrepeso · ≥ 30,0 obesidade.

**Fontes:**

- Ministério da Saúde/DATASUS. SISVAN — notas técnicas: classificação do estado nutricional de adultos e idosos. [link](http://tabnet.datasus.gov.br/cgi/SISVAN/CNV/notas_sisvan.html) — *documento oficial*. Cortes 18,5 / 25,0 / 30,0 para adultos (20 a 59 anos).
- NICE. Overweight and obesity management (NG246), 2025 — seção 1.9, recomendações 1.9.10 e 1.9.11. [link](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity) — *documento oficial*. Recomendação 1.9.10: saudável 18,5–24,9; sobrepeso 25–29,9; obesidade 30 ou mais (classes 1 a 3).
- WHO. Obesity: preventing and managing the global epidemic. WHO Technical Report Series 894, 2000. [link](https://iris.who.int/handle/10665/42330) — *documento oficial*. Tabela 2.1: baixo peso < 18,50; faixa normal 18,50–24,99; pré-obeso 25,00–29,99; obesidade classe I 30,00–34,99, II 35,00–39,99, III ≥ 40,00 — valores independentes de idade e sexo.

**Ressalvas:**

- Como no SISVAN, obesidade não é subdividida em classes 1, 2 e 3.
- Para pessoas de origem asiática, africana, caribenha ou do Oriente Médio a NICE (1.9.11) recomenda cortes menores; o app não aplica ajuste étnico.

**Exemplo resolvido:**

- Entradas: weight_kg = 70, height_m = 1,75
- Cálculo: 70 ÷ 1,75² = 22,857 → 22,86. Como 18,5 ≤ 22,86 < 25 → eutrofia.
- Resultado: value = 22,86 · classificação `eutrofia`

<a id="imc-idoso"></a>

## IMC do Idoso

`imc-idoso` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Cortes do idoso (Lipschitz, 1994) conferidos nas notas oficiais do SISVAN.

**Fórmula e pontos de corte:** IMC = peso (kg) / altura (m)². ≤ 22,0 baixo peso · > 22,0 e < 27,0 eutrofia (peso adequado) · ≥ 27,0 sobrepeso.

**Fontes:**

- Ministério da Saúde/DATASUS. SISVAN — notas técnicas: classificação do estado nutricional de adultos e idosos. [link](http://tabnet.datasus.gov.br/cgi/SISVAN/CNV/notas_sisvan.html) — *documento oficial*. Idosos (60 anos ou mais): ≤ 22,0 baixo peso; > 22,0 e < 27,0 peso adequado; ≥ 27,0 sobrepeso. Referência: Lipschitz, 1994.
- Lipschitz DA. Screening for nutritional status in the elderly. Prim Care. 1994;21(1):55-67. [link](https://pubmed.ncbi.nlm.nih.gov/8197257/) — *resumo da fonte (PubMed)*. Artigo original; o resumo não traz os pontos de corte.

**Exemplo resolvido:**

- Entradas: weight_kg = 50, height_m = 1,6
- Cálculo: 50 ÷ 1,60² = 19,53. Como 19,53 ≤ 22,0 → baixo peso.
- Resultado: value = 19,53 · classificação `baixo_peso`

<a id="peso-ideal"></a>

## Peso Ideal

`peso-ideal` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Fórmula de Devine conferida em reprodução aberta; o artigo original (1974) não é indexado e não foi acessado.

**Fórmula e pontos de corte:** Estatura em polegadas = metros × 39,3701. Homens: 50 + 2,3 × (polegadas − 60). Mulheres: 45,5 + 2,3 × (polegadas − 60).

**Fontes:**

- Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650-5 (não indexada; fórmula conferida em reprodução aberta). [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC13516392/) — *reprodução em artigo aberto*. 50 kg + 2,3 kg por polegada acima de 5 pés (homens) e 45,5 kg + 2,3 kg (mulheres).

**Ressalvas:**

- Abaixo de 5 pés (152,4 cm) a fórmula não é definida pelo autor; o app não subtrai (usa 0 polegada extra).
- A fórmula nasceu para dose de gentamicina, não como meta de peso; é usada assim por convenção.

**Exemplo resolvido:**

- Entradas: height_m = 1,8, sex = male
- Cálculo: 1,80 m = 70,866 pol; 70,866 − 60 = 10,866; 50 + 2,3 × 10,866 = 74,99 kg.
- Resultado: value = 74,99

<a id="perda-de-peso"></a>

## Perda de Peso %

`perda-de-peso` · versão v1 · **Conferência pendente** (conferido em 24/09/2026)

O cálculo do percentual é aritmético, mas a tabela de significância de Blackburn (1977) não pôde ser conferida na fonte original.

**Fórmula e pontos de corte:** % perda = (peso habitual − peso atual) / peso habitual × 100. Cortes usados (Blackburn, 1977): até 7 dias 1% significativa / 2% grave; até 1 mês 5%; até 3 meses 7,5%; até 6 meses 10%.

**Fontes:**

- Blackburn GL, Bistrian BR, Maini BS et al. Nutritional and metabolic assessment of the hospitalized patient. JPEN. 1977;1(1):11-22. [link](https://doi.org/10.1177/014860717700100101) — *fonte não acessada*. Tabela de perda de peso significativa × grave; artigo não acessível em versão aberta.

**Ressalvas:**

- No valor exato do corte único (5%, 7,5% ou 10%) o app classifica como perda grave; em várias reproduções o valor exato é perda significativa e só acima dele é grave. Aguarda conferência na fonte.

**Exemplo resolvido:**

- Entradas: usual_weight_kg = 100, current_weight_kg = 99,5, period_days = 7
- Cálculo: (100 − 99,5) ÷ 100 × 100 = 0,5% em 7 dias. Menor que 1% → sem perda significativa.
- Resultado: percentage = 0,5 · classificação `sem_perda_significativa`

<a id="cintura-quadril"></a>

## Cintura-Quadril

`cintura-quadril` · versão v2 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Cortes conferidos na Tabela A1 do relatório da OMS (2008): RCQ ≥ 0,90 (homens) e ≥ 0,85 (mulheres) indicam risco substancialmente aumentado de complicações metabólicas. O próprio relatório diz que a tabela reúne cortes "atribuídos à OMS" e não faz recomendação nova.

**Fórmula e pontos de corte:** RCQ = cintura (cm) / quadril (cm). Risco aumentado se RCQ ≥ 0,90 (homens) ou ≥ 0,85 (mulheres).

**Fontes:**

- WHO. Waist circumference and waist-hip ratio: report of a WHO expert consultation, Geneva, 8-11 December 2008. [link](https://www.who.int/publications/i/item/9789241501491) — *documento oficial*. Anexo A, Tabela A1: RCQ ≥ 0,90 (H) / ≥ 0,85 (M) = risco substancialmente aumentado. Capítulo 6: o relatório propõe como derivar cortes, sem recomendar valores novos.

**Ressalvas:**

- O mesmo anexo lembra que a definição de síndrome metabólica da OMS (1999) usa "acima de 0,90 / 0,85". O app segue a Tabela A1 (≥); só o valor exato do corte muda de uma leitura para a outra.
- O RCQ é arredondado a 2 casas antes da comparação, como é lido na prática.

**Mudanças:**

- 24/09/2026 (v2): O valor exato do corte (0,90 em homens, 0,85 em mulheres) passou a indicar risco aumentado, como na Tabela A1 da OMS (2008).

**Exemplo resolvido:**

- Entradas: waist_cm = 90, hip_cm = 100, sex = male
- Cálculo: 90 ÷ 100 = 0,90. Homem: 0,90 ≥ 0,90 → risco aumentado.
- Resultado: value = 0,9 · classificação `risco_aumentado`

<a id="relacao-cintura-estatura"></a>

## Cintura-Estatura

`relacao-cintura-estatura` · versão v2 · **Conferido na fonte** (conferido em 24/09/2026)

Faixas conferidas no texto oficial da NICE NG246 (recomendação 1.9.11).

**Fórmula e pontos de corte:** RCE = cintura (cm) / estatura (cm). < 0,4 fora da faixa classificada · 0,4–0,49 saudável · 0,5–0,59 aumentada · ≥ 0,6 alta.

**Fontes:**

- NICE. Overweight and obesity management (NG246), 2025 — seção 1.9, recomendações 1.9.10 e 1.9.11. [link](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity) — *documento oficial*. Adultos com IMC < 35: 0,4 a 0,49 adiposidade central saudável; 0,5 a 0,59 aumentada; 0,6 ou mais alta.
- Ashwell M, Gunn P, Gibson S. Waist-to-height ratio is a better screening tool than waist circumference and BMI for adult cardiometabolic risk factors. Obes Rev. 2012;13(3):275-86. [link](https://pubmed.ncbi.nlm.nih.gov/22106927/) — *resumo da fonte (PubMed)*. Base científica da relação cintura-estatura (meta-análise).

**Ressalvas:**

- A NICE aplica as faixas a adultos com IMC abaixo de 35.

**Mudanças:**

- 24/09/2026 (v2): Valores abaixo de 0,4 deixaram de ser chamados de 'saudável' (a NICE classifica só a partir de 0,4) e passam a sair como 'abaixo da faixa de referência'.

**Exemplo resolvido:**

- Entradas: waist_cm = 78, height_cm = 164
- Cálculo: 78 ÷ 164 = 0,4756 → 0,48. Entre 0,4 e 0,49 → saudável.
- Resultado: waist_height_ratio = 0,48 · classificação `adiposidade_central_saudavel`

<a id="indice-conicidade"></a>

## Índice de Conicidade

`indice-conicidade` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Fórmula (constante 0,109) e pontos de corte conferidos no texto completo de Pitanga & Lessa (2004).

**Fórmula e pontos de corte:** IC = cintura (m) / (0,109 × √(peso (kg) / estatura (m))). Risco coronariano elevado: ≥ 1,25 (homens) · ≥ 1,18 (mulheres).

**Fontes:**

- Pitanga FJG, Lessa I. Sensibilidade e especificidade do índice de conicidade como discriminador do risco coronariano de adultos em Salvador, Brasil. Rev Bras Epidemiol. 2004;7(3):259-69. [link](https://www.scielo.br/j/rbepid/a/S9YjKJfDvBn6p6Hg3PfxkqG/?lang=pt) — *texto completo da fonte*. Fórmula do índice C com a constante 0,109 e melhores pontos de corte 1,25 (homens) e 1,18 (mulheres), adultos de 30 a 74 anos.
- Valdez R. A simple model-based index of abdominal adiposity. J Clin Epidemiol. 1991;44(9):955-6. [link](https://pubmed.ncbi.nlm.nih.gov/1890438/) — *fonte não acessada*. Proposta original do índice; não acessada (sem resumo).

**Ressalvas:**

- Pontos de corte derivados de adultos de 30 a 74 anos de Salvador (BA).

**Exemplo resolvido:**

- Entradas: waist_cm = 100, weight_kg = 85, height_cm = 175, sex = male
- Cálculo: √(85 ÷ 1,75) = 6,9693; 0,109 × 6,9693 = 0,7597; 1,00 ÷ 0,7597 = 1,3164 → 1,32. Homem, ≥ 1,25 → risco coronariano elevado.
- Resultado: conicity_index = 1,32 · classificação `risco_coronariano_elevado`

<a id="gordura-corporal"></a>

## Gordura Corporal %

`gordura-corporal` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Equação de adultos de Deurenberg conferida no resumo do artigo original.

**Fórmula e pontos de corte:** %G = 1,20 × IMC + 0,23 × idade − 10,8 × sexo − 5,4 (sexo: homem = 1, mulher = 0). IMC arredondado a 2 casas.

**Fontes:**

- Deurenberg P, Weststrate JA, Seidell JC. Body mass index as a measure of body fatness: age- and sex-specific prediction formulas. Br J Nutr. 1991;65(2):105-14. [link](https://pubmed.ncbi.nlm.nih.gov/2043597/) — *resumo da fonte (PubMed)*. Adultos: BF% = 1,20 × BMI + 0,23 × age − 10,8 × sex − 5,4. Até 15 anos a relação é outra: BF% = 1,51 × BMI − 0,70 × age − 3,6 × sex + 1,4.

**Ressalvas:**

- A equação pediátrica do mesmo artigo (até 15 anos) não está implementada.

**Mudanças:**

- 24/09/2026 (v1): Idade mínima passou de 1 para 16 anos: o artigo mostra que até 15 anos vale outra equação.

**Exemplo resolvido:**

- Entradas: weight_kg = 70, height_m = 1,75, age_years = 30, sex = male
- Cálculo: IMC = 70 ÷ 1,75² = 22,86. 1,20 × 22,86 + 0,23 × 30 − 10,8 × 1 − 5,4 = 18,13%.
- Resultado: percentage = 18,13

<a id="jackson-pollock-3"></a>

## Jackson-Pollock (3 dobras)

`jackson-pollock-3` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Coeficientes conferidos em duas reproduções abertas independentes; os artigos originais só têm resumo aberto.

**Fórmula e pontos de corte:** Homens (peitoral + abdominal + coxa): D = 1,10938 − 0,0008267·Σ + 0,0000016·Σ² − 0,0002574·idade. Mulheres (tríceps + suprailíaca + coxa): D = 1,0994921 − 0,0009929·Σ + 0,0000023·Σ² − 0,0001392·idade. %G (Siri) = (4,95/D − 4,50) × 100.

**Fontes:**

- Jackson AS, Pollock ML. Generalized equations for predicting body density of men. Br J Nutr. 1978;40(3):497-504. [link](https://pubmed.ncbi.nlm.nih.gov/718832/) — *resumo da fonte (PubMed)*. Artigo original dos homens (18 a 61 anos); coeficientes não estão no resumo.
- Jackson AS, Pollock ML, Ward A. Generalized equations for predicting body density of women. Med Sci Sports Exerc. 1980;12(3):175-81. [link](https://pubmed.ncbi.nlm.nih.gov/7402053/) — *resumo da fonte (PubMed)*. Artigo original das mulheres (18 a 55 anos); coeficientes não estão no resumo.
- Reprodução aberta das equações de Jackson-Pollock de 3 dobras (com termo de idade), de Durnin-Womersley (faixas até 19 e 20-29 anos) e da equação de Siri. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC10453806/) — *reprodução em artigo aberto*. Equações de 3 dobras de homens e mulheres com termo de idade, e a equação de Siri.
- Reprodução aberta das equações de Jackson-Pollock de 3 e 7 dobras (homens e mulheres, com termo de idade). [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC11374165/) — *reprodução em artigo aberto*. Mesmos coeficientes de 3 dobras.

**Ressalvas:**

- As equações das mulheres foram validadas de 18 a 55 anos; o app aceita até 61 (limite dos homens).

**Exemplo resolvido:**

- Entradas: sex = male, age_years = 30, skinfold_chest_mm = 15, skinfold_abdominal_mm = 20, skinfold_thigh_mm = 18
- Cálculo: Σ = 15 + 20 + 18 = 53. D = 1,10938 − 0,0438151 + 0,0044944 − 0,007722 = 1,0623. %G = (4,95 ÷ 1,0623 − 4,50) × 100 = 15,95%.
- Resultado: body_fat_percent = 15,95, body_density = 1,0623, sum_skinfolds_mm = 53

<a id="jackson-pollock-7"></a>

## Jackson-Pollock (7 dobras)

`jackson-pollock-7` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Coeficientes conferidos em reprodução aberta; os artigos originais só têm resumo aberto.

**Fórmula e pontos de corte:** Σ de 7 dobras (peitoral, axilar média, tríceps, subescapular, abdominal, suprailíaca, coxa). Homens: D = 1,112 − 0,00043499·Σ + 0,00000055·Σ² − 0,00028826·idade. Mulheres: D = 1,097 − 0,00046971·Σ + 0,00000056·Σ² − 0,00012828·idade. %G (Siri) = (4,95/D − 4,50) × 100.

**Fontes:**

- Jackson AS, Pollock ML. Generalized equations for predicting body density of men. Br J Nutr. 1978;40(3):497-504. [link](https://pubmed.ncbi.nlm.nih.gov/718832/) — *resumo da fonte (PubMed)*. Artigo original dos homens; coeficientes não estão no resumo.
- Jackson AS, Pollock ML, Ward A. Generalized equations for predicting body density of women. Med Sci Sports Exerc. 1980;12(3):175-81. [link](https://pubmed.ncbi.nlm.nih.gov/7402053/) — *resumo da fonte (PubMed)*. Artigo original das mulheres; coeficientes não estão no resumo.
- Reprodução aberta das equações de Jackson-Pollock de 3 e 7 dobras (homens e mulheres, com termo de idade). [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC11374165/) — *reprodução em artigo aberto*. Equações de 7 dobras de homens e mulheres, com termo de idade.
- Reprodução aberta das equações de Jackson-Pollock de 3 dobras (com termo de idade), de Durnin-Womersley (faixas até 19 e 20-29 anos) e da equação de Siri. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC10453806/) — *reprodução em artigo aberto*. Equação de Siri.

**Ressalvas:**

- As equações das mulheres foram validadas de 18 a 55 anos; o app aceita até 61.

**Exemplo resolvido:**

- Entradas: sex = male, age_years = 40, skinfold_chest_mm = 10, skinfold_midaxillary_mm = 12, skinfold_triceps_mm = 9, skinfold_subscapular_mm = 14, skinfold_abdominal_mm = 20, skinfold_suprailiac_mm = 15, skinfold_thigh_mm = 13
- Cálculo: Σ = 93. D = 1,112 − 0,0404541 + 0,0047570 − 0,0115304 = 1,0648. %G = (4,95 ÷ 1,0648 − 4,50) × 100 = 14,89%.
- Resultado: body_fat_percent = 14,89, body_density = 1,0648, sum_skinfolds_mm = 93

<a id="durnin-womersley"></a>

## Durnin-Womersley

`durnin-womersley` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Os 10 pares de coeficientes (5 faixas etárias × 2 sexos) conferidos em duas reproduções abertas; o artigo original (1974) não foi acessado.

**Fórmula e pontos de corte:** D = c − m × log10(Σ bíceps + tríceps + subescapular + suprailíaca), com c e m por sexo e faixa etária (17–19, 20–29, 30–39, 40–49, 50+). %G (Siri) = (4,95/D − 4,50) × 100.

**Fontes:**

- Durnin JV, Womersley J. Body fat assessed from total body density and its estimation from skinfold thickness. Br J Nutr. 1974;32(1):77-97. [link](https://pubmed.ncbi.nlm.nih.gov/4843734/) — *fonte não acessada*. Tabela original de c e m; artigo não acessível em versão aberta.
- Reprodução aberta das equações de Jackson-Pollock de 3 dobras (com termo de idade), de Durnin-Womersley (faixas até 19 e 20-29 anos) e da equação de Siri. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC10453806/) — *reprodução em artigo aberto*. Homens até 19 anos 1,1620 / 0,0630 e 20–29 anos 1,1631 / 0,0632; mulheres até 19 anos 1,1549 / 0,0678 e 20–29 anos 1,1599 / 0,0717; equação de Siri.
- Naz H, Mushtaq K, Butt BA, Khawaja KI. Estimation of body fat in Pakistani adult: a comparison of equations based upon skinfold thickness measurements. Pak J Med Sci. 2017;33(3):635-9. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC5510117/) — *reprodução em artigo aberto*. Tabela de Durnin-Womersley por idade e sexo: homens 17–19 1,1620/0,0630; 20–29 1,1631/0,0632; 30–39 1,1422/0,0544; 40–49 1,1620/0,0700; 50+ 1,1715/0,0779; mulheres 17–19 1,1549/0,0678; 20–29 1,1599/0,0717; 30–39 1,1423/0,0632; 40–49 1,1333/0,0612; 50+ 1,1339/0,0645.

**Ressalvas:**

- A reprodução escreve a última faixa como "> 50"; o app usa 50 anos ou mais, como é usual para a tabela original (a faixa anterior termina em 49).

**Exemplo resolvido:**

- Entradas: sex = male, age_years = 25, skinfold_biceps_mm = 6, skinfold_triceps_mm = 12, skinfold_subscapular_mm = 15, skinfold_suprailiac_mm = 14
- Cálculo: Homem de 25 anos → c = 1,1631, m = 0,0632. Σ = 47; log10(47) = 1,6721. D = 1,1631 − 0,0632 × 1,6721 = 1,0574. %G = (4,95 ÷ 1,0574 − 4,50) × 100 = 18,12%.
- Resultado: body_fat_percent = 18,12, body_density = 1,0574, sum_skinfolds_mm = 47

<a id="harris-benedict"></a>

## Harris-Benedict

`harris-benedict` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Coeficientes da revisão de Roza & Shizgal (1984) conferidos em reprodução aberta; o resumo original não os traz.

**Fórmula e pontos de corte:** Homens: 88,362 + 13,397 × peso + 4,799 × estatura (cm) − 5,677 × idade. Mulheres: 447,593 + 9,247 × peso + 3,098 × estatura (cm) − 4,330 × idade.

**Fontes:**

- Roza AM, Shizgal HM. The Harris Benedict equation reevaluated: resting energy requirements and the body cell mass. Am J Clin Nutr. 1984;40(1):168-82. [link](https://pubmed.ncbi.nlm.nih.gov/6741850/) — *resumo da fonte (PubMed)*. Artigo original da revisão; coeficientes não estão no resumo. Precisão de ±14% em pessoas bem nutridas; pouco confiável em desnutridos.
- Reprodução aberta dos coeficientes de Roza e Shizgal (tabela de equações de metabolismo basal). [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC13288070/) — *reprodução em artigo aberto*. Coeficientes 88,362 / 13,397 / 4,799 / 5,677 e 447,593 / 9,247 / 3,098 / 4,330.

**Ressalvas:**

- O próprio artigo mostra que a equação subestima o gasto em pacientes desnutridos.

**Exemplo resolvido:**

- Entradas: weight_kg = 70, height_cm = 175, age_years = 30, sex = male
- Cálculo: 88,362 + 13,397 × 70 + 4,799 × 175 − 5,677 × 30 = 88,362 + 937,79 + 839,825 − 170,31 = 1.695,67 kcal.
- Resultado: bmr_kcal = 1695,67

<a id="mifflin-st-jeor"></a>

## Mifflin-St Jeor

`mifflin-st-jeor` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Equações simplificadas por sexo conferidas no resumo do artigo original.

**Fórmula e pontos de corte:** Homens: 10 × peso + 6,25 × estatura (cm) − 5 × idade + 5. Mulheres: 10 × peso + 6,25 × estatura (cm) − 5 × idade − 161.

**Fontes:**

- Mifflin MD, St Jeor ST, Hill LA et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-7. [link](https://pubmed.ncbi.nlm.nih.gov/2305711/) — *resumo da fonte (PubMed)*. REE (homens) = 10 × peso + 6,25 × altura − 5 × idade + 5; REE (mulheres) = … − 161. Derivada em 498 adultos de 19 a 78 anos.

**Exemplo resolvido:**

- Entradas: weight_kg = 70, height_cm = 175, age_years = 30, sex = male
- Cálculo: 10 × 70 + 6,25 × 175 − 5 × 30 + 5 = 700 + 1.093,75 − 150 + 5 = 1.648,75 kcal.
- Resultado: bmr_kcal = 1648,75

<a id="schofield"></a>

## Schofield

`schofield` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Os 12 coeficientes conferidos na Tabela 5.2 do relatório FAO/OMS/ONU (2004).

**Fórmula e pontos de corte:** TMB = a × peso + b, por sexo e faixa (< 3, 3–10, 10–18, 18–30, 30–60, ≥ 60 anos). Ex.: homens < 3 anos 59,512 × peso − 30,4.

**Fontes:**

- FAO/WHO/UNU. Human energy requirements: report of a Joint FAO/WHO/UNU Expert Consultation (Roma, 2001). FAO Food and Nutrition Technical Report Series 1, 2004. [link](https://www.fao.org/4/y5686e/y5686e.pdf) — *documento oficial*. Tabela 5.2: coeficientes de Schofield em kcal/dia para as 6 faixas etárias de cada sexo.
- Schofield WN. Predicting basal metabolic rate, new standards and review of previous work. Hum Nutr Clin Nutr. 1985;39 Suppl 1:5-41. [link](https://pubmed.ncbi.nlm.nih.gov/4044297/) — *resumo da fonte (PubMed)*. Artigo original das equações.

**Exemplo resolvido:**

- Entradas: age_years = 2, sex = male, weight_kg = 12
- Cálculo: Menino de 2 anos → faixa < 3 anos: 59,512 × 12 − 30,4 = 683,74 kcal.
- Resultado: bmr_kcal = 683,74

<a id="cunningham"></a>

## Cunningham

`cunningham` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Equação conferida no resumo do artigo original.

**Fórmula e pontos de corte:** TMB = 500 + 22 × massa magra (kg); massa magra = peso × (1 − %G/100).

**Fontes:**

- Cunningham JJ. A reanalysis of the factors influencing basal metabolic rate in normal adults. Am J Clin Nutr. 1980;33(11):2372-4. [link](https://pubmed.ncbi.nlm.nih.gov/7435418/) — *resumo da fonte (PubMed)*. BMR (cal/day) = 500 + 22 (LBM).

**Ressalvas:**

- A massa magra é estimada a partir do % de gordura informado (dobras ou bioimpedância).

**Exemplo resolvido:**

- Entradas: weight_kg = 70, body_fat_percent = 20
- Cálculo: Massa magra = 70 × (1 − 0,20) = 56 kg. TMB = 500 + 22 × 56 = 1.732 kcal.
- Resultado: bmr_kcal = 1732, lean_mass_kg = 56

<a id="formula-de-bolso"></a>

## Fórmula de Bolso

`formula-de-bolso` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Conta aritmética (peso × fator escolhido pelo profissional). As faixas de kcal/kg foram conferidas nas diretrizes da ESPEN.

**Fórmula e pontos de corte:** GET = peso (kg) × fator (20 a 35 kcal/kg/dia, escolhido pelo profissional).

**Fontes:**

- Singer P, Blaser AR, Berger MM et al. ESPEN guideline on clinical nutrition in the intensive care unit. Clin Nutr. 2019;38(1):48-79. [link](https://www.espen.org/files/ESPEN-Guidelines/ESPEN_guideline-on-clinical-nutrition-in-the-intensive-care-unit.pdf) — *texto completo da fonte*. Sem calorimetria indireta: equações simples por peso, como 20–25 kcal/kg/dia, no doente crítico.
- Gomes F, Schuetz P, Bounoure L et al. ESPEN guidelines on nutritional support for polymorbid internal medicine patients. Clin Nutr. 2018;37(1):336-53. [link](https://www.espen.org/files/ESPEN-Guidelines/ESPEN_guidelines_on_nutritional_support_for_polymorbid_internal_medicine_patients.pdf) — *texto completo da fonte*. Pacientes polimórbidos: 27 kcal/kg de peso atual; 30 kcal/kg no baixo peso grave.
- Volkert D, Beck AM, Cederholm T et al. ESPEN guideline on clinical nutrition and hydration in geriatrics. Clin Nutr. 2019;38(1):10-47. [link](https://www.espen.org/files/ESPEN-Guidelines/ESPEN_guideline_on_clincal_nutrition_and_hydration_in_geriatrics.pdf) — *texto completo da fonte*. Idosos: cerca de 30 kcal/kg/dia como valor orientador.

**Ressalvas:**

- A citação anterior (ASPEN, McClave 2016) não pôde ser conferida; a referência passou a apontar as diretrizes da ESPEN conferidas.

**Mudanças:**

- 24/09/2026 (v1): Referência atualizada para as diretrizes da ESPEN conferidas; a conta não mudou.

**Exemplo resolvido:**

- Entradas: weight_kg = 70, factor_kcal_per_kg = 25
- Cálculo: 70 × 25 = 1.750 kcal/dia.
- Resultado: get_kcal = 1750

<a id="valor-calorico-total"></a>

## Valor Calórico Total

`valor-calorico-total` · versão v2 · **Conferido na fonte** (conferido em 24/09/2026)

VCT = TMB × PAL, com o PAL na faixa e nas categorias de estilo de vida da Tabela 5.3 da FAO/OMS/ONU; o exemplo resolvido é o do próprio relatório (seção 5.4.1).

**Fórmula e pontos de corte:** VCT = TMB × PAL, com PAL de 1,40 a 2,40. Estilo de vida (Tabela 5.3): sedentário ou atividade leve 1,40–1,69 · ativo ou moderadamente ativo 1,70–1,99 · vigorosamente ativo 2,00–2,40.

**Fontes:**

- FAO/WHO/UNU. Human energy requirements: report of a Joint FAO/WHO/UNU Expert Consultation (Roma, 2001). FAO Food and Nutrition Technical Report Series 1, 2004. [link](https://www.fao.org/4/y5686e/y5686e.pdf) — *documento oficial*. Tabela 5.3 (PAL 1,40–1,69 / 1,70–1,99 / 2,00–2,40; acima de 2,40 é difícil de manter) e seção 5.4.1 (necessidade = TMB × PAL; exemplo: 1.302 kcal × 1,85 = 2.410 kcal/dia, calculado em MJ).

**Ressalvas:**

- O profissional escolhe o PAL dentro da faixa da FAO; a classificação só nomeia o estilo de vida correspondente.
- A FAO lembra que os valores servem para grupos; para um indivíduo, o PAL deve refletir a atividade habitual dele.
- O relatório calcula em MJ (5,45 × 1,85 = 10,08 MJ = 2.410 kcal); em kcal direto, 1.302 × 1,85 = 2.408,7.

**Mudanças:**

- 24/09/2026 (v2): Fatores 1,2 · 1,375 · 1,55 · 1,725 · 1,9 (sem fonte na FAO) substituídos pelo PAL da FAO, de 1,40 a 2,40, escolhido pelo profissional, com a categoria de estilo de vida da Tabela 5.3.

**Exemplo resolvido:**

- Entradas: bmr_kcal = 1302, pal = 1,85
- Cálculo: 1.302 × 1,85 = 2.408,7 kcal/dia. PAL 1,85 está entre 1,70 e 1,99 → ativo ou moderadamente ativo.
- Resultado: vct_kcal = 2408,7 · classificação `ativo_ou_moderadamente_ativo`

<a id="distribuicao-macros"></a>

## Distribuição de Macros

`distribuicao-macros` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Faixas AMDR (45–65% carboidrato, 20–35% lipídio, 10–35% proteína) conferidas em reprodução aberta; fatores de Atwater (4 e 9 kcal/g) convencionais.

**Fórmula e pontos de corte:** gramas = VCT × % / 100 ÷ 4 (carboidrato, proteína) ou ÷ 9 (lipídio). Faixas aceitas: carboidrato 45–65%, proteína 10–35%, lipídio 20–35%; a soma precisa ser 100%.

**Fontes:**

- Institute of Medicine. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids. Washington: National Academies Press, 2005. [link](https://doi.org/10.17226/10490) — *fonte não acessada*. Faixas AMDR para adultos; documento não acessado.
- Alcalá-Santiago Á, Rodríguez-Martín NM, Casas-Albertos E et al. Nutrient adequacy and environmental foot-print of Mediterranean, pesco-, ovo-lacto-, and vegan menus: a modelling study. Front Nutr. 2025;12:1681512. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC12644066/) — *reprodução em artigo aberto*. AMDR do IOM: carboidratos 45–65% da energia, lipídios 20–35%, proteínas 10–35%.

**Ressalvas:**

- As faixas AMDR são para adultos; a soma dos três percentuais precisa ser 100% (senão o cálculo é recusado).

**Mudanças:**

- 24/09/2026 (v1): Percentuais que não somam 100% passam a ser recusados com mensagem (antes o app devolvia gramas incoerentes, ex.: 65 + 35 + 35 = 135%).

**Exemplo resolvido:**

- Entradas: total_kcal = 2000, carb_percent = 50, protein_percent = 20, fat_percent = 30
- Cálculo: 2.000 × 50% ÷ 4 = 250 g de carboidrato; 2.000 × 20% ÷ 4 = 100 g de proteína; 2.000 × 30% ÷ 9 = 66,67 g de lipídio.
- Resultado: carbohydrate_g = 250, protein_g = 100, fat_g = 66,67

<a id="necessidades-proteicas"></a>

## Necessidades Proteicas

`necessidades-proteicas` · versão v2 · **Conferido na fonte** (conferido em 24/09/2026)

Conta aritmética (peso × g/kg/dia) com a meta escolhida pelo profissional. As recomendações mostradas como orientação foram conferidas no texto completo das diretrizes da ESPEN.

**Fórmula e pontos de corte:** Proteína (g/dia) = peso (kg) × meta (g/kg/dia), com a meta entre 0,3 e 3,0 g/kg/dia.

**Fontes:**

- Singer P, Blaser AR, Berger MM et al. ESPEN practical and partially revised guideline: clinical nutrition in the intensive care unit. Clin Nutr. 2023;42(9):1671-89. [link](https://www.espen.org/files/ESPEN-Guidelines/ESPEN_practical_and_partially_revised_guideline_Clinical_nutrition_in_the_intensive_care_unit.pdf) — *texto completo da fonte*. Recomendação para o doente crítico: 1,3 g/kg/dia de proteína, oferecida de forma progressiva.
- Gomes F, Schuetz P, Bounoure L et al. ESPEN guidelines on nutritional support for polymorbid internal medicine patients. Clin Nutr. 2018;37(1):336-53. [link](https://www.espen.org/files/ESPEN-Guidelines/ESPEN_guidelines_on_nutritional_support_for_polymorbid_internal_medicine_patients.pdf) — *texto completo da fonte*. Recomendação 5.1: polimórbidos internados que precisam de suporte nutricional devem receber no mínimo 1,0 g/kg/dia (grau A).
- Volkert D, Beck AM, Cederholm T et al. ESPEN guideline on clinical nutrition and hydration in geriatrics. Clin Nutr. 2019;38(1):10-47. [link](https://www.espen.org/files/ESPEN-Guidelines/ESPEN_guideline_on_clincal_nutrition_and_hydration_in_geriatrics.pdf) — *texto completo da fonte*. Idosos: pelo menos 1,0 g/kg/dia; o texto cita 0,8 g/kg/dia como a recomendação tradicional para adultos de todas as idades.

**Ressalvas:**

- O app não escolhe a meta: a necessidade proteica depende do quadro clínico, e as diretrizes dão valores para situações específicas, não uma escala por "gravidade".
- Os 0,8 g/kg/dia para adultos saudáveis (DRI do Institute of Medicine) foram conferidos pela citação na diretriz da ESPEN de geriatria; o documento do IOM não foi acessado.
- Qual peso usar (atual, ideal, ajustado) também é decisão clínica; a ESPEN (UTI) sugere peso ajustado em pacientes com obesidade.

**Mudanças:**

- 24/09/2026 (v2): Os fatores 0,8 · 1,2 · 1,5 · 2,0 g/kg por "contexto clínico" (sem correspondência nas diretrizes) deram lugar à meta em g/kg/dia escolhida pelo profissional, com as recomendações da ESPEN como orientação no formulário.

**Exemplo resolvido:**

- Entradas: weight_kg = 70, protein_g_per_kg = 1,3
- Cálculo: 70 kg × 1,3 g/kg/dia (meta da ESPEN para o doente crítico) = 91 g/dia.
- Resultado: protein_g_per_day = 91

<a id="ingestao-liquidos"></a>

## Ingestão de Líquidos

`ingestao-liquidos` · versão v2 · **Conferido na fonte** (conferido em 24/09/2026)

Conta aritmética (peso × mL/kg/dia) com o volume escolhido pelo profissional. A faixa de 30–35 mL/kg, que era atribuída à ESPEN sem constar da diretriz citada, foi retirada.

**Fórmula e pontos de corte:** Líquidos (mL/dia) = peso (kg) × volume (mL/kg/dia), com o volume entre 10 e 60 mL/kg/dia.

**Fontes:**

- Bischoff SC, Austin P, Boeykens K et al. ESPEN guideline on home enteral nutrition. Clin Nutr. 2020;39(1):5-22. [link](https://www.espen.org/files/ESPEN-Guidelines/ESPEN_guideline_on_home_enteral_nutrition.pdf) — *texto completo da fonte*. Não traz recomendação de volume por kg de peso (motivo da retirada dos 30–35 mL/kg/dia).
- Volkert D, Beck AM, Cederholm T et al. ESPEN guideline on clinical nutrition and hydration in geriatrics. Clin Nutr. 2019;38(1):10-47. [link](https://www.espen.org/files/ESPEN-Guidelines/ESPEN_guideline_on_clincal_nutrition_and_hydration_in_geriatrics.pdf) — *texto completo da fonte*. Idosos: oferecer pelo menos 1,6 L/dia de bebidas às mulheres e 2,0 L/dia aos homens, salvo condição clínica que peça outra conduta (mostrado como orientação no formulário).

**Ressalvas:**

- O app não escolhe o volume: a necessidade hídrica depende do quadro clínico (febre, perdas, insuficiência cardíaca ou renal etc.).
- Para crianças e para a manutenção em pacientes internados há a calculadora de Holliday-Segar.

**Mudanças:**

- 24/09/2026 (v2): A faixa fixa de 30–35 mL/kg/dia (sem fonte conferida) deu lugar ao volume em mL/kg/dia escolhido pelo profissional.

**Exemplo resolvido:**

- Entradas: weight_kg = 70, ml_per_kg = 30
- Cálculo: 70 kg × 30 mL/kg/dia = 2.100 mL/dia.
- Resultado: ml_per_day = 2100

<a id="nrs-2002"></a>

## NRS-2002

`nrs-2002` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Tabela de pontuação (estado nutricional e gravidade da doença, 0 a 3), ajuste de idade e corte ≥ 3 conferidos em reprodução aberta; o formulário original da ESPEN (2002) não foi acessado.

**Fórmula e pontos de corte:** Total = escore do estado nutricional (0–3) + escore de gravidade da doença (0–3) + 1 se idade ≥ 70 anos. Total ≥ 3 → risco nutricional.

**Fontes:**

- Kondrup J, Rasmussen HH, Hamberg O, Stanga Z. Nutritional risk screening (NRS 2002): a new method based on an analysis of controlled clinical trials. Clin Nutr. 2003;22(3):321-36. [link](https://pubmed.ncbi.nlm.nih.gov/12765673/) — *resumo da fonte (PubMed)*. Artigo do método; o resumo não traz a tabela de pontuação.
- Kondrup J, Allison SP, Elia M, Vellas B, Plauth M. ESPEN guidelines for nutrition screening 2002. Clin Nutr. 2003;22(4):415-21. [link](https://doi.org/10.1016/s0261-5614(03)00098-0) — *fonte não acessada*. Diretriz da ESPEN com o formulário do NRS-2002; não acessada.
- Kabashneh S, Alkassis S, Shanah L, Ali H. A complete guide to identify and manage malnutrition in hospitalized patients. Cureus. 2020;12(6):e8486. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC7343301/) — *reprodução em artigo aberto*. Tabela 2 (NRS 2002): itens de 0 a 3 para estado nutricional (perda de peso > 5% em 3, 2 ou 1 mês — ou > 15% em 3 meses —, IMC 18,5–20,5 ou < 18,5 com estado geral comprometido, ingestão 50–75%, 25–50% ou 0–25%) e para gravidade da doença; + 1 ponto se ≥ 70 anos; total ≥ 3 indica avaliação e intervenção.

**Ressalvas:**

- A reprodução traz "APACHE 10" para o escore 3 de gravidade; o formulário usual é "APACHE > 10", como no app.

**Exemplo resolvido:**

- Entradas: nutritional_status_score = 2, severity_score = 1, age_years = 45
- Cálculo: 2 (estado nutricional) + 1 (gravidade) + 0 (45 anos) = 3 → risco nutricional.
- Resultado: total_score = 3 · classificação `risco_nutricional`

<a id="must"></a>

## MUST

`must` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Pontuações e faixas de risco conferidas no formulário oficial da BAPEN.

**Fórmula e pontos de corte:** IMC: > 20 → 0 · 18,5–20 → 1 · < 18,5 → 2. Perda de peso não intencional em 3–6 meses: < 5% → 0 · 5–10% → 1 · > 10% → 2. Doença aguda sem ingestão > 5 dias → 2. Total 0 baixo · 1 médio · ≥ 2 alto risco.

**Fontes:**

- BAPEN / Malnutrition Advisory Group. The MUST (Malnutrition Universal Screening Tool): formulário e tabelas oficiais. [link](https://www.bapen.org.uk/pdfs/must/must-full.pdf) — *documento oficial*. Passos 1 a 3 e faixas de risco (0 baixo, 1 médio, 2 ou mais alto).

**Ressalvas:**

- O IMC é calculado com peso e altura; valores exatamente no corte (ex.: 18,5) são tratados sem o ruído de ponto flutuante.

**Exemplo resolvido:**

- Entradas: weight_kg = 70, height_m = 1,7, weight_loss_percent = 2, acute_disease_effect = não
- Cálculo: IMC = 70 ÷ 1,70² = 24,2 (> 20) → 0; perda de 2% → 0; sem doença aguda → 0. Total 0 → baixo risco.
- Resultado: total_score = 0 · classificação `risco_baixo`

<a id="mna-sf"></a>

## MNA-SF

`mna-sf` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Itens, pontuações e as três categorias conferidos no formulário oficial (revisão 2009) e no texto completo de Kaiser et al. (2009).

**Fórmula e pontos de corte:** Soma de 6 itens (A ingestão 0–2, B perda de peso 0–3, C mobilidade 0–2, D estresse/doença aguda 0 ou 2, E neuropsicológico 0–2, F IMC 0–3). 12–14 normal · 8–11 risco de desnutrição · 0–7 desnutrido.

**Fontes:**

- Nestlé Nutrition Institute. Mini Nutritional Assessment MNA-SF (formulário oficial, revisão 2009). [link](https://www.mna-elderly.com/sites/default/files/2021-10/mna-mini-english.pdf) — *documento oficial*. Formulário MNA-SF: pontuação de cada item e faixas 12–14 / 8–11 / 0–7.
- Kaiser MJ, Bauer JM, Ramsch C et al. Validation of the Mini Nutritional Assessment short-form (MNA-SF): a practical tool for identification of nutritional status. J Nutr Health Aging. 2009;13(9):782-8. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC12878690/) — *texto completo da fonte*. Validação da versão revisada com três categorias: 0–7 desnutrido; 8–11 risco; 12–14 bem nutrido.
- Rubenstein LZ, Harker JO, Salvà A, Guigoz Y, Vellas B. Screening for undernutrition in geriatric practice: developing the short-form mini-nutritional assessment (MNA-SF). J Gerontol A Biol Sci Med Sci. 2001;56(6):M366-72. [link](https://pubmed.ncbi.nlm.nih.gov/11382797/) — *resumo da fonte (PubMed)*. Versão original (duas categorias, corte 11).

**Ressalvas:**

- O formulário permite trocar o IMC pela circunferência da panturrilha (0 ou 3 pontos); no app use a pontuação equivalente no item F.

**Mudanças:**

- 24/09/2026 (v1): Citação corrigida: as três categorias usadas são as de Kaiser et al. (2009), não as de Rubenstein et al. (2001).

**Exemplo resolvido:**

- Entradas: food_intake_score = 2, weight_loss_score = 3, mobility_score = 2, psychological_stress_score = 2, neuropsychological_score = 2, bmi_score = 3
- Cálculo: 2 + 3 + 2 + 2 + 2 + 3 = 14 → 12 a 14 → estado nutricional normal.
- Resultado: total_score = 14 · classificação `estado_nutricional_normal`

<a id="asg-detsky"></a>

## ASG (Detsky)

`asg-detsky` · versão v2 · **Conferido, com ressalvas** (conferido em 24/09/2026)

A classificação (A, B ou C) passou a ser a que o avaliador atribui, como no método original; o app só registra os domínios e conta quantos ficaram em cada categoria. Conferido no resumo do artigo de 1987.

**Fórmula e pontos de corte:** Classificação = julgamento global do avaliador: A bem nutrido · B moderadamente desnutrido ou suspeita · C gravemente desnutrido. Contagem de domínios em A, B e C apenas como apoio.

**Fontes:**

- Detsky AS, McLaughlin JR, Baker JP et al. What is subjective global assessment of nutritional status? JPEN. 1987;11(1):8-13. [link](https://pubmed.ncbi.nlm.nih.gov/3820522/) — *resumo da fonte (PubMed)*. Técnica clínica baseada em história e exame físico; a classificação é o julgamento do avaliador. Na análise multivariada, o que mais pesou foi a perda de tecido subcutâneo, a perda muscular e a perda de peso.

**Ressalvas:**

- Só o resumo do artigo foi acessado; o formulário original (itens de história e de exame físico) não foi conferido. A marcação A/B/C por domínio é um roteiro do app, não parte do método publicado.

**Mudanças:**

- 24/09/2026 (v2): A classificação deixou de ser a categoria mais frequente entre os domínios (regra sem fonte) e passou a ser a classificação global escolhida pelo avaliador.

**Exemplo resolvido:**

- Entradas: weight_change_rating = A, dietary_intake_rating = A, gi_symptoms_rating = A, functional_capacity_rating = A, metabolic_demand_rating = A, physical_exam_rating = A, global_rating = A
- Cálculo: Todos os domínios em A e classificação global A (do avaliador) → bem nutrido.
- Resultado: count_a = 6, count_b = 0, count_c = 0 · classificação `bem_nutrido`

<a id="pg-sga-sf"></a>

## PG-SGA SF

`pg-sga-sf` · versão v1 · **Conferência pendente** (conferido em 24/09/2026)

As faixas de triagem são as mais usadas, mas o formulário oficial (e o valor máximo de cada box) não pôde ser conferido.

**Fórmula e pontos de corte:** Total = box 1 + box 2 + box 3 + box 4. 0–1 sem intervenção · 2–3 educação nutricional · 4–8 intervenção por nutricionista · ≥ 9 intervenção crítica.

**Fontes:**

- Ottery FD. Definition of standardized nutritional assessment and interventional pathways in oncology. Nutrition. 1996;12(1 Suppl):S15-9; formulário oficial PG-SGA (Pt-Global). [link](https://pt-global.org) — *fonte não acessada*. Formulário oficial; não acessado.
- Uso das faixas de pontuação do PG-SGA SF (0-3, 4-8, 9 ou mais) em artigo de acesso aberto. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC11719838/) — *reprodução em artigo aberto*. Faixas de pontuação 0–3, 4–8 e 9 ou mais usadas em artigo aberto (compatíveis com as do app).

**Ressalvas:**

- Limites aceitos por box no app: 0–4, 0–4, 0–24, 0–4. O box 1 do formulário pode somar pontos extras (perda nas últimas 2 semanas); conferir no formulário oficial.

**Exemplo resolvido:**

- Entradas: box1_weight_history_score = 0, box2_food_intake_score = 0, box3_symptoms_score = 0, box4_activity_function_score = 0
- Cálculo: 0 + 0 + 0 + 0 = 0 → sem necessidade de intervenção.
- Resultado: total_score = 0 · classificação `sem_necessidade_intervencao`

<a id="glim"></a>

## GLIM

`glim` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Critérios fenotípicos, etiológicos e graus de gravidade conferidos no texto completo do consenso GLIM (Tabelas 3 e 4).

**Fórmula e pontos de corte:** Desnutrição = ≥ 1 critério fenotípico + ≥ 1 etiológico. Moderada: perda 5–10% em 6 meses ou 10–20% em mais de 6 meses; IMC < 20 (< 70 anos) ou < 22 (≥ 70); déficit muscular leve/moderado. Grave: perda > 10% em 6 meses ou > 20% em mais de 6 meses; IMC < 18,5 (< 70 anos) ou < 20 (≥ 70); déficit muscular grave.

**Fontes:**

- Cederholm T, Jensen GL, Correia MITD et al. GLIM criteria for the diagnosis of malnutrition: a consensus report from the global clinical nutrition community. J Cachexia Sarcopenia Muscle. 2019;10(1):207-17 (também Clin Nutr. 2019;38(1):1-9). [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC6438340/) — *texto completo da fonte*. Tabela 3 (critérios) e Tabela 4 (gravidade: estágio 1 moderado e estágio 2 grave).

**Ressalvas:**

- A Tabela 3 fala em perda '> 5%' e a Tabela 4 em '5–10%'; o app considera 5% como moderada. Os cortes de IMC para asiáticos não estão implementados.

**Exemplo resolvido:**

- Entradas: weight_loss_percent = 3, weight_loss_period_months = 6, bmi = 23, age_years = 50, reduced_muscle_mass = nenhuma, reduced_food_intake = não, disease_burden_inflammation = não
- Cálculo: Perda de 3% em 6 meses, IMC 23 com 50 anos e sem perda muscular → nenhum critério fenotípico → sem desnutrição.
- Resultado: phenotypic_severity = 0, etiologic_criteria_met = 0 · classificação `sem_desnutricao`

<a id="conut"></a>

## CONUT

`conut` · versão v2 · **Conferido na fonte** (conferido em 24/09/2026)

Faixas e pontos conferidos na Tabela I do artigo original (texto completo).

**Fórmula e pontos de corte:** Albumina (g/dL): ≥ 3,5 → 0 · 3,0–3,49 → 2 · 2,5–2,9 → 4 · < 2,5 → 6. Colesterol (mg/dL): > 180 → 0 · 140–180 → 1 · 100–139 → 2 · < 100 → 3. Linfócitos (/mm³): ≥ 1.600 → 0 · 1.200–1.599 → 1 · 800–1.199 → 2 · < 800 → 3. Total: 0–1 normal · 2–4 leve · 5–8 moderada · 9–12 grave.

**Fontes:**

- Ignacio de Ulíbarri J, González-Madroño A, de Villar NG et al. CONUT: una herramienta para controlar el estado nutritivo. Primera validación en una población hospitalaria. Nutr Hosp. 2005;20(1):38-45. [link](https://scielo.isciii.es/scielo.php?script=sci_arttext&pid=S0212-16112005000100006) — *texto completo da fonte*. Tabela I: faixas de albumina, linfócitos e colesterol, pontos de cada faixa e classificação do total.

**Ressalvas:**

- A tabela original não inclui exatamente 1.600 linfócitos em nenhuma faixa (> 1600 e 1200–1599); o app considera 1.600 normal.

**Mudanças:**

- 24/09/2026 (v2): Colesterol exatamente 180 mg/dL passou a valer 1 ponto, como na Tabela I (a faixa 140–180 inclui o 180). Antes valia 0.

**Exemplo resolvido:**

- Entradas: albumin_g_dl = 4, total_cholesterol_mg_dl = 200, lymphocytes_cells_mm3 = 2000
- Cálculo: Albumina 4,0 → 0; colesterol 200 → 0; linfócitos 2.000 → 0. Total 0 → normal.
- Resultado: total_score = 0 · classificação `normal`

<a id="pni"></a>

## PNI

`pni` · versão v2 · **Conferência pendente** (conferido em 24/09/2026)

Fórmula conferida só em reproduções, que divergem no coeficiente da transferrina (0,20 em duas, 0,22 em uma); o artigo original não é aberto. As faixas de risco usadas antes (< 30, 30–59, ≥ 60) não tinham fonte e foram retiradas.

**Fórmula e pontos de corte:** PNI (%) = 158 − 16,6 × albumina (g/dL) − 0,78 × prega tricipital (mm) − 0,20 × transferrina (mg/dL) − 5,8 × hipersensibilidade cutânea tardia (0 anérgico, 1 induração < 5 mm, 2 ≥ 5 mm). Sem classificação.

**Fontes:**

- Buzby GP, Mullen JL, Matthews DC, Hobbs CL, Rosato EF. Prognostic nutritional index in gastrointestinal surgery. Am J Surg. 1980;139(1):160-7. [link](https://pubmed.ncbi.nlm.nih.gov/7350839/) — *resumo da fonte (PubMed)*. Artigo original do índice (Am J Surg, 1980); o resumo não traz a fórmula nem faixas de risco.
- Mori S, Usami N, Fukumoto K et al. The significance of the prognostic nutritional index in patients with completely resected non-small cell lung cancer. PLoS One. 2015;10(9):e0136897. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC4565697/) — *reprodução em artigo aberto*. Fórmula de Buzby: 158 − 16,6 × albumina − 0,78 × prega tricipital − 0,20 × transferrina − 5,8 × hipersensibilidade.
- Iwata E, Obata K, Kikuta S et al. Admission prognostic nutritional index predicts prolonged hospitalization in severe odontogenic deep neck infections. Odontology. 2026;114(2):664-73. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC13053453/) — *reprodução em artigo aberto*. Mesma fórmula, mas com 0,22 × transferrina; hipersensibilidade pontuada de 0 a 2.

**Ressalvas:**

- O coeficiente da transferrina precisa ser conferido no artigo original: o app usa 0,20, como na maioria das reproduções.
- Uma calculadora on-line (ScyMed MediCalc) usa faixas < 40% baixo, 40–49% moderado e > 50% alto risco e pontua a hipersensibilidade como anérgico = 1, reativo = 2 — diferente da pontuação 0–2 das reproduções em artigos. Nenhuma das faixas foi adotada sem o artigo original.

**Mudanças:**

- 24/09/2026 (v2): Retirada a classificação de risco (< 30 / 30–59 / ≥ 60, sem fonte) e corrigida a citação (Am J Surg, não Ann Surg); o cálculo não mudou.

**Exemplo resolvido:**

- Entradas: albumin_g_dl = 4, triceps_skinfold_mm = 15, transferrin_mg_dl = 250, delayed_hypersensitivity = maior_igual_5mm
- Cálculo: 158 − 16,6 × 4,0 − 0,78 × 15 − 0,20 × 250 − 5,8 × 2 = 158 − 66,4 − 11,7 − 50 − 11,6 = 18,3%.
- Resultado: pni_percent = 18,3

<a id="mnutric"></a>

## mNUTRIC

`mnutric` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Pontuação conferida na Tabela 4 de Heyland et al. (2011, texto completo); o corte de alto risco (≥ 5 sem IL-6), de Rahman et al. (2016), conferido em reprodução aberta.

**Fórmula e pontos de corte:** Idade < 50 → 0 · 50–74 → 1 · ≥ 75 → 2. APACHE II < 15 → 0 · 15–19 → 1 · 20–27 → 2 · ≥ 28 → 3. SOFA < 6 → 0 · 6–9 → 1 · ≥ 10 → 2. Comorbidades ≥ 2 → 1. Dias do hospital à UTI ≥ 1 → 1. Total ≥ 5 → alto risco.

**Fontes:**

- Heyland DK, Dhaliwal R, Jiang X, Day AG. Identifying critically ill patients who benefit the most from nutrition therapy: the development and initial validation of a novel risk assessment tool. Crit Care. 2011;15(6):R268. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC3388687/) — *texto completo da fonte*. Tabela 4: faixas e pontos de idade, APACHE II, SOFA, comorbidades e dias até a UTI (a IL-6 é o item retirado no mNUTRIC).
- Rahman A, Hasan RM, Agarwala R et al. Identifying critically-ill patients who will benefit most from nutritional therapy: further validation of the modified NUTRIC nutritional risk assessment tool. Clin Nutr. 2016;35(1):158-62. [link](https://pubmed.ncbi.nlm.nih.gov/25698099/) — *resumo da fonte (PubMed)*. Validação do mNUTRIC sem IL-6; o resumo não traz o corte ≥ 5.
- Lin PY, Yen YT, Lu MJ, Hsu HS. Association between energy adequacy and clinical outcomes in septic intensive care unit patients stratified by modified Nutrition Risk in the Critically Ill score. J Chin Med Assoc. 2026;89(8):634-41. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC13524160/) — *reprodução em artigo aberto*. mNUTRIC de 0 a 9 pontos; ≥ 5 indica alto risco nutricional.

**Ressalvas:**

- A Tabela 4 põe APACHE 28 nas faixas '20–28' e '≥ 28'; o app usa 3 pontos para 28.

**Exemplo resolvido:**

- Entradas: age_years = 45, apache_ii = 10, sofa = 3, comorbidities_count = 1, days_hospital_to_icu = 0
- Cálculo: 45 anos → 0; APACHE 10 → 0; SOFA 3 → 0; 1 comorbidade → 0; 0 dia até a UTI → 0. Total 0 → baixo risco.
- Resultado: total_score = 0 · classificação `baixo_risco_nutricional`

<a id="penn-state"></a>

## Penn State

`penn-state` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Equações 2003b e 2010 conferidas em resumos originais e em revisão aberta; escolha automática da versão conferida no resumo de 2011.

**Fórmula e pontos de corte:** Mifflin-St Jeor com peso atual. 2003b: 0,96 × Mifflin + 31 × Ve + 167 × Tmax − 6212. 2010 (≥ 60 anos e IMC ≥ 30): 0,71 × Mifflin + 85 × Tmax + 64 × Ve − 3085.

**Fontes:**

- Frankenfield DC, Coleman A, Alam S, Cooney RN. Analysis of estimation methods for resting metabolic rate in critically ill adults. JPEN. 2009;33(1):27-36. [link](https://pubmed.ncbi.nlm.nih.gov/19011147/) — *resumo da fonte (PubMed)*. Versão para idosos com obesidade: Mifflin(0,71) + Tmax(85) + Ve(64) − 3085.
- Frankenfield D. Validation of an equation for resting metabolic rate in older obese, critically ill patients. JPEN. 2011;35(2):264-9. [link](https://pubmed.ncbi.nlm.nih.gov/21378256/) — *resumo da fonte (PubMed)*. Validação da versão modificada em pacientes com 60 anos ou mais e IMC ≥ 30.
- Revisão de acesso aberto 'Methods for Estimating Energy Expenditure in Critically Ill Adults' (tabela com as versões 2003b e 2010 da equação de Penn State). [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC7520823/) — *reprodução em artigo aberto*. 2003b: 0,96 (Mifflin) + 31 (Ve) + 167 (Tmax) − 6212.
- Frankenfield D, Smith JS, Cooney RN. Validation of 2 approaches to predicting resting metabolic rate in critically ill patients. JPEN. 2004;28(4):259-64. [link](https://pubmed.ncbi.nlm.nih.gov/15291408/) — *resumo da fonte (PubMed)*. Validação das equações de Penn State.

**Mudanças:**

- 24/09/2026 (v1): A versão aplicada e o rótulo passaram a usar o mesmo IMC, e um IMC exatamente 30 (ex.: 76,8 kg e 1,60 m) conta como ≥ 30 apesar do erro de ponto flutuante.

**Exemplo resolvido:**

- Entradas: weight_kg = 80, height_cm = 175, age_years = 50, sex = male, minute_ventilation_l_min = 10, max_temperature_c = 37,5
- Cálculo: Mifflin = 10 × 80 + 6,25 × 175 − 5 × 50 + 5 = 1.648,75. 50 anos → 2003b: 0,96 × 1.648,75 + 31 × 10 + 167 × 37,5 − 6.212 = 1.943,3 kcal.
- Resultado: ree_kcal = 1943,3, mifflin_kcal = 1648,75, bmi = 26,12 · classificação `equacao_2003b`

<a id="swinamer"></a>

## Swinamer

`swinamer` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Equação conferida no resumo do artigo original.

**Fórmula e pontos de corte:** GE (kcal/dia) = 945 × SC (m²) − 6,4 × idade + 108 × T (°C) + 24,2 × f (irpm) + 817 × VC (L) − 4349.

**Fontes:**

- Swinamer DL, Grace MG, Hamilton SM et al. Predictive equation for assessing energy expenditure in mechanically ventilated critically ill patients. Crit Care Med. 1990;18(6):657-61. [link](https://pubmed.ncbi.nlm.nih.gov/2344758/) — *resumo da fonte (PubMed)*. EE = 945 BSA − 6,4 age + 108 Temp + 24,2 f + 817 VT − 4349 (112 pacientes em ventilação mecânica).

**Exemplo resolvido:**

- Entradas: body_surface_area_m2 = 1,9, age_years = 50, temperature_c = 37,5, respiratory_rate = 18, tidal_volume_l = 0,5
- Cálculo: 945 × 1,9 − 6,4 × 50 + 108 × 37,5 + 24,2 × 18 + 817 × 0,5 − 4.349 = 2.020,6 kcal.
- Resultado: ree_kcal = 2020,6

<a id="curreri"></a>

## Curreri (Queimados)

`curreri` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Fórmula (25 kcal/kg + 40 kcal por % de superfície queimada) conferida em reproduções abertas; o artigo original (1974) não foi acessado.

**Fórmula e pontos de corte:** kcal/dia = 25 × peso (kg) + 40 × %SCQ.

**Fontes:**

- Curreri PW, Richmond D, Marvin J, Baxter CR. Dietary requirements of patients with major burns. J Am Diet Assoc. 1974;65(4):415-7. [link](https://pubmed.ncbi.nlm.nih.gov/4213656/) — *fonte não acessada*. Artigo original; não acessado.
- Artigo de acesso aberto que descreve a fórmula de Curreri como 40 kcal por 1% de superfície corporal queimada. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC4199722/) — *reprodução em artigo aberto*. Fórmula de Curreri com 40 kcal por 1% de superfície queimada; comparada à calorimetria indireta, superestimou o gasto (acurácia de 30% no estudo), sobretudo nos grandes queimados.
- Jeschke MG, Mlcak RP, Finnerty CC et al. Gender differences in pediatric burn patients: does it make a difference? Ann Surg. 2008;248(1):126-36. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC7863567/) — *reprodução em artigo aberto*. Fórmula de Curreri: 25 kcal/kg/dia mais 40 kcal por % de superfície corporal queimada por dia.

**Ressalvas:**

- Estudos com calorimetria indireta mostram que a fórmula superestima o gasto em grandes queimados; trate o resultado como estimativa inicial.

**Exemplo resolvido:**

- Entradas: weight_kg = 70, burned_body_surface_percent = 30
- Cálculo: 25 × 70 + 40 × 30 = 1.750 + 1.200 = 2.950 kcal/dia.
- Resultado: get_kcal = 2950

<a id="toronto"></a>

## Toronto (Queimados)

`toronto` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Equação conferida no resumo do artigo original.

**Fórmula e pontos de corte:** GER = −4343 + 10,5 × %SCQ + 0,23 × ingestão calórica + 0,84 × Harris-Benedict + 114 × T (°C) − 4,5 × dias pós-queimadura.

**Fontes:**

- Allard JP, Pichard C, Hoshino E et al. Validation of a new formula for calculating the energy requirements of burn patients. JPEN. 1990;14(2):115-8. [link](https://pubmed.ncbi.nlm.nih.gov/2112617/) — *resumo da fonte (PubMed)*. Fórmula de Toronto: −4343 + (10,5 × %TBSA) + (0,23 × CI) + (0,84 × EBEE) + (114 × Temp) − (4,5 × PBD).

**Ressalvas:**

- O artigo não diz qual versão da equação de Harris-Benedict usou; o valor é informado pelo profissional.

**Exemplo resolvido:**

- Entradas: burned_body_surface_percent = 40, caloric_intake_kcal = 2000, harris_benedict_kcal = 1600, temperature_c = 38, post_burn_day = 5
- Cálculo: −4.343 + 10,5 × 40 + 0,23 × 2.000 + 0,84 × 1.600 + 114 × 38 − 4,5 × 5 = 2.190,5 kcal.
- Resultado: ree_kcal = 2190,5

<a id="balanco-nitrogenado"></a>

## Balanço Nitrogenado

`balanco-nitrogenado` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Fórmula clínica padrão conferida em reprodução aberta; a fonte original citada (Blackburn, 1977) não foi acessada.

**Fórmula e pontos de corte:** BN = proteína ingerida (g) ÷ 6,25 − (nitrogênio ureico urinário 24 h + 4).

**Fontes:**

- Blackburn GL, Bistrian BR, Maini BS et al. Nutritional and metabolic assessment of the hospitalized patient. JPEN. 1977;1(1):11-22. [link](https://doi.org/10.1177/014860717700100101) — *fonte não acessada*. Fonte citada para o fator 6,25 e as perdas não ureicas de 4 g; não acessada.
- Yun JH, Han M, Bae G et al. The PROGAIN trial: a randomized controlled trial of high-protein peripheral parenteral nutrition on nitrogen balance and recovery after gastric cancer surgery - study protocol. PLoS One. 2026;21(8):e0355677. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC13450730/) — *reprodução em artigo aberto*. Fórmula clínica simplificada: BN (g/dia) = proteína ingerida ÷ 6,25 − (nitrogênio ureico urinário de 24 h + 4); divisor 6,25 porque a proteína tem cerca de 16% de nitrogênio.

**Ressalvas:**

- Na forma reproduzida, o nitrogênio de uma nutrição parenteral entra somado à parte (valor do rótulo da solução); o app converte toda a proteína informada por 6,25.

**Exemplo resolvido:**

- Entradas: protein_intake_g = 90, urinary_urea_nitrogen_24h_g = 10
- Cálculo: 90 ÷ 6,25 = 14,4 g de N; 14,4 − (10 + 4) = 0,4 g/dia → balanço positivo.
- Resultado: balance_g_per_day = 0,4 · classificação `balanco_positivo`

<a id="holliday-segar"></a>

## Holliday-Segar

`holliday-segar` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Regra 100 / 50 / 20 mL/kg conferida em revisão aberta; o artigo original (1957) não foi acessado.

**Fórmula e pontos de corte:** Até 10 kg: 100 mL/kg · 10–20 kg: 1.000 mL + 50 mL/kg acima de 10 kg · > 20 kg: 1.500 mL + 20 mL/kg acima de 20 kg.

**Fontes:**

- Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19(5):823-32. [link](https://pubmed.ncbi.nlm.nih.gov/13431307/) — *fonte não acessada*. Artigo original; não acessado.
- AlQahtani SN, AlGubaisi S, AlHaffaf FA et al. Nutrition support therapy for hospitalized children with malnutrition: a narrative review. Healthcare (Basel). 2025;13(5):497. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC11899272/) — *reprodução em artigo aberto*. Holliday-Segar: 100 mL/kg nos primeiros 10 kg; 50 mL/kg nos 10 kg seguintes; 20 mL/kg por kg acima de 20 kg.

**Ressalvas:**

- A mesma revisão lembra que recém-nascidos e lactentes pequenos costumam precisar de volumes individualizados, e que o resultado é um ponto de partida a ajustar pelo estado de hidratação e pela doença.

**Exemplo resolvido:**

- Entradas: weight_kg = 8
- Cálculo: 8 kg × 100 mL = 800 mL/dia.
- Resultado: ml_per_day = 800

<a id="nutricao-parenteral"></a>

## Nutrição Parenteral

`nutricao-parenteral` · versão v2 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Conta aritmética: nitrogênio = proteína ÷ 6,25 e relação = kcal não proteicas ÷ g de N. A classificação por faixa "recomendada" (100–150 kcal/g N), que não tinha fonte conferida, foi retirada.

**Fórmula e pontos de corte:** N (g) = proteína (g) ÷ 6,25; relação = kcal não proteicas ÷ N (g). Sem classificação.

**Fontes:**

- Yun JH, Han M, Bae G et al. The PROGAIN trial: a randomized controlled trial of high-protein peripheral parenteral nutrition on nitrogen balance and recovery after gastric cancer surgery - study protocol. PLoS One. 2026;21(8):e0355677. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC13450730/) — *reprodução em artigo aberto*. Fórmula clínica simplificada: BN (g/dia) = proteína ingerida ÷ 6,25 − (nitrogênio ureico urinário de 24 h + 4); divisor 6,25 porque a proteína tem cerca de 16% de nitrogênio.

**Ressalvas:**

- O divisor 6,25 (16% de nitrogênio na proteína) é convenção; algumas soluções de aminoácidos informam o nitrogênio no rótulo, e aí vale o valor do produto.
- A meta da relação depende do quadro clínico; o app mostra o valor sem julgar se está adequado.

**Mudanças:**

- 24/09/2026 (v2): Retirada a classificação por faixa de 100–150 kcal/g N (sem fonte conferida); o cálculo não mudou.

**Exemplo resolvido:**

- Entradas: non_protein_kcal = 1500, protein_g = 75
- Cálculo: 75 ÷ 6,25 = 12 g de N; 1.500 ÷ 12 = 125 kcal não proteicas por g de N.
- Resultado: nitrogen_g = 12, kcal_per_gram_nitrogen = 125

<a id="dieta-enteral"></a>

## Dieta Enteral

`dieta-enteral` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Conta aritmética, sem constante clínica.

**Fórmula e pontos de corte:** Taxa (mL/h) = volume-alvo (mL) ÷ duração da infusão (h).

**Fontes:**

- Nenhuma fonte clínica (conta aritmética ou fonte ainda não identificada — ver ressalvas).

**Ressalvas:**

- Não há parâmetro científico a conferir: o volume e a duração são definidos pelo profissional.

**Exemplo resolvido:**

- Entradas: target_volume_ml = 1440, infusion_duration_hours = 24
- Cálculo: 1.440 ÷ 24 = 60 mL/h.
- Resultado: rate_ml_per_hour = 60

<a id="oms-peso-idade-0-5"></a>

## Peso/Idade (OMS)

`oms-peso-idade-0-5` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Tabela oficial da OMS e algoritmo do pacote anthro; classificação conferida no Quadro 5 da Norma Técnica do SISVAN (2011).

**Fórmula e pontos de corte:** Escore-Z pelo método LMS: z = ((medida/M)^L − 1) / (L × S). Nos indicadores de peso, além de ±3 DP usa-se o escore restrito da OMS (distância entre 2 e 3 DP). < −3 muito baixo peso · −3 a < −2 baixo peso · −2 a +2 adequado · > +2 peso elevado.

**Fontes:**

- WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards (2006): tabelas LMS oficiais do pacote anthro e algoritmo do próprio pacote. [link](https://www.who.int/tools/child-growth-standards/standards) — *documento oficial*. Tabelas LMS copiadas sem alteração dos pacotes oficiais; algoritmo portado do código-fonte dos pacotes (idade em dias arredondada, correção de ±0,7 cm deitado/em pé, interpolação). Gabarito da própria OMS nos testes.
- Ministério da Saúde. Orientações para a coleta e análise de dados antropométricos em serviços de saúde: Norma Técnica do SISVAN. Brasília, 2011. [link](https://bvsms.saude.gov.br/bvs/publicacoes/orientacoes_coleta_analise_dados_antropometricos.pdf) — *documento oficial*. Quadro 5: pontos de corte de peso-para-idade (0 a 10 anos).

**Exemplo resolvido:**

- Entradas: age_months = 50,004106776181, sex = female, weight_kg = 17
- Cálculo: Menina, 1.522 dias: L = −0,3387, M = 16,4330, S = 0,14051. z = ((17 ÷ 16,433)^−0,3387 − 1) ÷ (−0,3387 × 0,14051) = 0,24 → peso adequado.
- Resultado: z_score = 0,24 · classificação `peso_adequado_para_idade`

<a id="oms-comprimento-idade-0-5"></a>

## Comprimento/Idade (OMS)

`oms-comprimento-idade-0-5` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Tabela oficial da OMS e algoritmo do pacote anthro, com o caso de teste oficial da própria OMS (z = −6,09); classificação do SISVAN (Quadro 9).

**Fórmula e pontos de corte:** Escore-Z pelo método LMS: z = ((medida/M)^L − 1) / (L × S). Nos indicadores de peso, além de ±3 DP usa-se o escore restrito da OMS (distância entre 2 e 3 DP). < −3 muito baixa estatura · −3 a < −2 baixa estatura · ≥ −2 adequada.

**Fontes:**

- WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards (2006): tabelas LMS oficiais do pacote anthro e algoritmo do próprio pacote. [link](https://www.who.int/tools/child-growth-standards/standards) — *documento oficial*. Tabelas LMS copiadas sem alteração dos pacotes oficiais; algoritmo portado do código-fonte dos pacotes (idade em dias arredondada, correção de ±0,7 cm deitado/em pé, interpolação). Gabarito da própria OMS nos testes.
- Ministério da Saúde. Orientações para a coleta e análise de dados antropométricos em serviços de saúde: Norma Técnica do SISVAN. Brasília, 2011. [link](https://bvsms.saude.gov.br/bvs/publicacoes/orientacoes_coleta_analise_dados_antropometricos.pdf) — *documento oficial*. Quadro 9: pontos de corte de estatura-para-idade.

**Exemplo resolvido:**

- Entradas: age_months = 32,427104722793, sex = male, length_cm = 72,86, measurement_position = deitado
- Cálculo: Menino, 987 dias, medido deitado → 72,86 − 0,7 = 72,16 cm (a partir de 731 dias a referência é em pé). L = 1, M = 93,6743, S = 0,03772. z = (72,16 ÷ 93,6743 − 1) ÷ 0,03772 = −6,09 (valor do caso de teste oficial da OMS) → muito baixa estatura.
- Resultado: z_score = -6,09, measure = 72,16 · classificação `muito_baixa_estatura_para_idade`

<a id="oms-peso-comprimento-0-5"></a>

## Peso/Comprimento (OMS)

`oms-peso-comprimento-0-5` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Tabela oficial da OMS (peso-para-comprimento e peso-para-estatura) e algoritmo do pacote anthro; classificação do SISVAN (Quadro 6).

**Fórmula e pontos de corte:** Escore-Z pelo método LMS: z = ((medida/M)^L − 1) / (L × S). Nos indicadores de peso, além de ±3 DP usa-se o escore restrito da OMS (distância entre 2 e 3 DP). < −3 magreza acentuada · −3 a < −2 magreza · −2 a +1 eutrofia · > +1 a +2 risco de sobrepeso · > +2 a +3 sobrepeso · > +3 obesidade.

**Fontes:**

- WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards (2006): tabelas LMS oficiais do pacote anthro e algoritmo do próprio pacote. [link](https://www.who.int/tools/child-growth-standards/standards) — *documento oficial*. Tabelas LMS copiadas sem alteração dos pacotes oficiais; algoritmo portado do código-fonte dos pacotes (idade em dias arredondada, correção de ±0,7 cm deitado/em pé, interpolação). Gabarito da própria OMS nos testes.
- Ministério da Saúde. Orientações para a coleta e análise de dados antropométricos em serviços de saúde: Norma Técnica do SISVAN. Brasília, 2011. [link](https://bvsms.saude.gov.br/bvs/publicacoes/orientacoes_coleta_analise_dados_antropometricos.pdf) — *documento oficial*. Quadro 6: pontos de corte de peso-para-estatura (0 a 5 anos).

**Exemplo resolvido:**

- Entradas: age_months = 12, sex = male, weight_kg = 9,5, length_cm = 75,35, measurement_position = deitado
- Cálculo: Menino, 75,35 cm deitado: L = −0,3521, M = 9,5740, S = 0,08299 (interpolado a cada 0,1 cm). z = ((9,5 ÷ 9,574)^−0,3521 − 1) ÷ (−0,3521 × 0,08299) = −0,09 → eutrofia.
- Resultado: z_score = -0,09, reference_median = 9,57 · classificação `eutrofia`

<a id="oms-imc-idade-0-5"></a>

## IMC/Idade (OMS 0–5)

`oms-imc-idade-0-5` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Tabela oficial da OMS e algoritmo do pacote anthro; classificação do SISVAN (Quadro 7).

**Fórmula e pontos de corte:** Escore-Z pelo método LMS: z = ((medida/M)^L − 1) / (L × S). Nos indicadores de peso, além de ±3 DP usa-se o escore restrito da OMS (distância entre 2 e 3 DP). Mesmas faixas do peso-para-estatura (magreza acentuada a obesidade).

**Fontes:**

- WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards (2006): tabelas LMS oficiais do pacote anthro e algoritmo do próprio pacote. [link](https://www.who.int/tools/child-growth-standards/standards) — *documento oficial*. Tabelas LMS copiadas sem alteração dos pacotes oficiais; algoritmo portado do código-fonte dos pacotes (idade em dias arredondada, correção de ±0,7 cm deitado/em pé, interpolação). Gabarito da própria OMS nos testes.
- Ministério da Saúde. Orientações para a coleta e análise de dados antropométricos em serviços de saúde: Norma Técnica do SISVAN. Brasília, 2011. [link](https://bvsms.saude.gov.br/bvs/publicacoes/orientacoes_coleta_analise_dados_antropometricos.pdf) — *documento oficial*. Quadro 7: pontos de corte de IMC-para-idade para menores de 5 anos.

**Exemplo resolvido:**

- Entradas: age_months = 18, sex = male, weight_kg = 11, length_cm = 80, measurement_position = deitado
- Cálculo: Menino, 548 dias, 11 kg e 80 cm: IMC = 17,19. L = −0,5485, M = 16,1388, S = 0,07873. z = 0,79 → eutrofia.
- Resultado: z_score = 0,79, measure = 17,19 · classificação `eutrofia`

<a id="oms-perimetro-cefalico-0-5"></a>

## Perímetro Cefálico (OMS)

`oms-perimetro-cefalico-0-5` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Tabela oficial da OMS e algoritmo do pacote anthro; os cortes de microcefalia (−2 e −3 DP) conferidos na orientação da OMS de 2016. O corte de macrocefalia (> +2 DP) não tem fonte conferida.

**Fórmula e pontos de corte:** Escore-Z pelo método LMS: z = ((medida/M)^L − 1) / (L × S). Nos indicadores de peso, além de ±3 DP usa-se o escore restrito da OMS (distância entre 2 e 3 DP). < −3 microcefalia grave · −3 a < −2 microcefalia · −2 a +2 adequado · > +2 macrocefalia.

**Fontes:**

- WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards (2006): tabelas LMS oficiais do pacote anthro e algoritmo do próprio pacote. [link](https://www.who.int/tools/child-growth-standards/standards) — *documento oficial*. Tabelas LMS copiadas sem alteração dos pacotes oficiais; algoritmo portado do código-fonte dos pacotes (idade em dias arredondada, correção de ±0,7 cm deitado/em pé, interpolação). Gabarito da própria OMS nos testes.
- WHO. Screening, assessment and management of neonates and infants with complications associated with Zika virus exposure in utero. 2016. [link](https://www.who.int/publications/i/item/WHO-ZIKV-MOC-16.3-Rev.2) — *documento oficial*. Seção 3.1.1: microcefalia = perímetro cefálico mais de 2 desvios-padrão abaixo da mediana para idade e sexo; grave = mais de 3 desvios-padrão abaixo.

**Ressalvas:**

- O corte de macrocefalia (> +2 DP) é convencional e não tem fonte conferida nesta auditoria.

**Exemplo resolvido:**

- Entradas: age_months = 6, sex = female, head_circumference_cm = 42
- Cálculo: Menina, 183 dias, 42 cm: L = 1, M = 42,2079, S = 0,03087. z = (42 ÷ 42,2079 − 1) ÷ 0,03087 = −0,16 → adequado para a idade.
- Resultado: z_score = -0,16 · classificação `adequado_para_idade`

<a id="oms-imc-idade-5-19"></a>

## IMC/Idade (OMS 5–19)

`oms-imc-idade-5-19` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Tabela oficial da OMS 2007 e algoritmo do pacote anthroplus; classificação do SISVAN (Quadros 8 e 13), inclusive a extensão até 19 anos e 11 meses.

**Fórmula e pontos de corte:** Escore-Z pelo método LMS: z = ((medida/M)^L − 1) / (L × S). Nos indicadores de peso, além de ±3 DP usa-se o escore restrito da OMS (distância entre 2 e 3 DP). < −3 magreza acentuada · −3 a < −2 magreza · −2 a +1 eutrofia · > +1 a +2 sobrepeso · > +2 a +3 obesidade · > +3 obesidade grave. De 19 anos e 1 mês a 19 anos e 11 meses usam-se os valores de 19 anos completos.

**Fontes:**

- de Onis M, Onyango AW, Borghi E et al. Development of a WHO growth reference for school-aged children and adolescents. Bull World Health Organ. 2007;85(9):660-7: tabelas LMS oficiais do pacote anthroplus. [link](https://www.who.int/tools/growth-reference-data-for-5to19-years) — *documento oficial*. Tabelas LMS copiadas sem alteração dos pacotes oficiais; algoritmo portado do código-fonte dos pacotes (idade em dias arredondada, correção de ±0,7 cm deitado/em pé, interpolação). Gabarito da própria OMS nos testes.
- Ministério da Saúde. Orientações para a coleta e análise de dados antropométricos em serviços de saúde: Norma Técnica do SISVAN. Brasília, 2011. [link](https://bvsms.saude.gov.br/bvs/publicacoes/orientacoes_coleta_analise_dados_antropometricos.pdf) — *documento oficial*. Quadros 8 e 13: pontos de corte de IMC-para-idade; nota do Quadro 13 sobre 19 anos e 1 mês a 19 anos e 11 meses.

**Mudanças:**

- 24/09/2026 (v1): Passou a aceitar de 229 a 239 meses usando os valores de 19 anos completos, como manda a Norma Técnica do SISVAN (antes o app recusava essa faixa).

**Exemplo resolvido:**

- Entradas: age_months = 80,65, sex = male, weight_kg = 18,8, height_cm = 114,6
- Cálculo: Menino, 80,65 meses, 18,8 kg e 114,6 cm: IMC = 14,31. L = −1,1784, M = 15,4244, S = 0,08952 (interpolado por mês). z = −0,87 → eutrofia.
- Resultado: z_score = -0,87 · classificação `eutrofia`

<a id="oms-estatura-idade-5-19"></a>

## Estatura/Idade (OMS 5–19)

`oms-estatura-idade-5-19` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Tabela oficial da OMS 2007 e algoritmo do pacote anthroplus; classificação do SISVAN (Quadro 14).

**Fórmula e pontos de corte:** Escore-Z pelo método LMS: z = ((medida/M)^L − 1) / (L × S). Nos indicadores de peso, além de ±3 DP usa-se o escore restrito da OMS (distância entre 2 e 3 DP). < −3 muito baixa estatura · −3 a < −2 baixa estatura · ≥ −2 adequada.

**Fontes:**

- de Onis M, Onyango AW, Borghi E et al. Development of a WHO growth reference for school-aged children and adolescents. Bull World Health Organ. 2007;85(9):660-7: tabelas LMS oficiais do pacote anthroplus. [link](https://www.who.int/tools/growth-reference-data-for-5to19-years) — *documento oficial*. Tabelas LMS copiadas sem alteração dos pacotes oficiais; algoritmo portado do código-fonte dos pacotes (idade em dias arredondada, correção de ±0,7 cm deitado/em pé, interpolação). Gabarito da própria OMS nos testes.
- Ministério da Saúde. Orientações para a coleta e análise de dados antropométricos em serviços de saúde: Norma Técnica do SISVAN. Brasília, 2011. [link](https://bvsms.saude.gov.br/bvs/publicacoes/orientacoes_coleta_analise_dados_antropometricos.pdf) — *documento oficial*. Quadro 14: pontos de corte de estatura-para-idade de adolescentes.

**Exemplo resolvido:**

- Entradas: age_months = 80,65, sex = male, height_cm = 114,6
- Cálculo: Menino, 80,65 meses, 114,6 cm: L = 1, M = 120,1411, S = 0,04316. z = (114,6 ÷ 120,1411 − 1) ÷ 0,04316 = −1,07 → estatura adequada.
- Resultado: z_score = -1,07 · classificação `estatura_adequada_para_idade`

<a id="oms-peso-idade-5-10"></a>

## Peso/Idade (OMS 5–10)

`oms-peso-idade-5-10` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Tabela oficial da OMS 2007 (publicada só até 10 anos) e algoritmo do pacote anthroplus; classificação do SISVAN (Quadro 5).

**Fórmula e pontos de corte:** Escore-Z pelo método LMS: z = ((medida/M)^L − 1) / (L × S). Nos indicadores de peso, além de ±3 DP usa-se o escore restrito da OMS (distância entre 2 e 3 DP). < −3 muito baixo peso · −3 a < −2 baixo peso · −2 a +2 adequado · > +2 peso elevado.

**Fontes:**

- de Onis M, Onyango AW, Borghi E et al. Development of a WHO growth reference for school-aged children and adolescents. Bull World Health Organ. 2007;85(9):660-7: tabelas LMS oficiais do pacote anthroplus. [link](https://www.who.int/tools/growth-reference-data-for-5to19-years) — *documento oficial*. Tabelas LMS copiadas sem alteração dos pacotes oficiais; algoritmo portado do código-fonte dos pacotes (idade em dias arredondada, correção de ±0,7 cm deitado/em pé, interpolação). Gabarito da própria OMS nos testes.
- Ministério da Saúde. Orientações para a coleta e análise de dados antropométricos em serviços de saúde: Norma Técnica do SISVAN. Brasília, 2011. [link](https://bvsms.saude.gov.br/bvs/publicacoes/orientacoes_coleta_analise_dados_antropometricos.pdf) — *documento oficial*. Quadro 5: pontos de corte de peso-para-idade (0 a 10 anos).

**Exemplo resolvido:**

- Entradas: age_months = 80,65, sex = male, weight_kg = 18,8
- Cálculo: Menino, 80,65 meses, 18,8 kg: L = −0,4072, M = 22,2108, S = 0,13640. z = −1,26 → peso adequado.
- Resultado: z_score = -1,26 · classificação `peso_adequado_para_idade`

<a id="gomez"></a>

## Gomez

`gomez` · versão v1 · **Conferência pendente** (conferido em 24/09/2026)

A mediana vem da tabela oficial da OMS (conferida). As faixas de Gómez aparecem em reprodução aberta como 76–90 / 61–75 / < 60%, com limites que não coincidem exatamente com os do app; o artigo original só existe como imagem digitalizada.

**Fórmula e pontos de corte:** % da mediana = peso ÷ mediana OMS de peso para a idade × 100. ≥ 90% sem desnutrição · 75–89,9% 1º grau · 60–74,9% 2º grau · < 60% 3º grau.

**Fontes:**

- Gómez F, Ramos Galván R, Frenk S et al. Mortality in second and third degree malnutrition. J Trop Pediatr. 1956;2:77-83 (republicado em Bull World Health Organ. 2000;78(10):1275-80). [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC2560616/) — *fonte não acessada*. Artigo original; não conferido (imagem digitalizada).
- WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards (2006): tabelas LMS oficiais do pacote anthro e algoritmo do próprio pacote. [link](https://www.who.int/tools/child-growth-standards/standards) — *documento oficial*. Mediana de peso-para-idade (tabela oficial).
- Sandler A. The legacy of a standard of normality in child nutrition research. SSM Popul Health. 2021;15:100865. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC8319510/) — *reprodução em artigo aberto*. Gómez et al. (1956): peso para a idade 76–90% da mediana = 1º grau, 61–75% = 2º grau, menos de 60% = 3º grau.

**Ressalvas:**

- Os autores usavam a referência da época; o app usa a mediana dos Padrões OMS 2006, que é a prática atual (ADR 0002).
- Nos valores exatos dos limites a reprodução e o app podem divergir (ex.: 90% é 1º grau na reprodução e sem desnutrição no app; 75% é 2º grau na reprodução e 1º grau no app). Nada foi alterado sem o texto original.

**Exemplo resolvido:**

- Entradas: age_months = 12, sex = male, weight_kg = 7
- Cálculo: Menino, 365 dias: mediana OMS = 9,646 kg. 7,0 ÷ 9,646 × 100 = 72,57% → 60 a 74,9% → desnutrição de 2º grau.
- Resultado: percent_of_median = 72,57, reference_median = 9,65 · classificação `desnutricao_segundo_grau`

<a id="waterlow"></a>

## Waterlow

`waterlow` · versão v1 · **Conferência pendente** (conferido em 24/09/2026)

As medianas vêm das tabelas oficiais da OMS (conferidas) e o corte de 90% do peso para a estatura foi conferido em reprodução aberta; o de 95% da estatura para a idade ainda não. O artigo original só existe como imagem digitalizada.

**Fórmula e pontos de corte:** P/E = peso ÷ mediana OMS de peso-para-estatura × 100; E/I = estatura ÷ mediana OMS de estatura-para-idade × 100. P/E < 90% = déficit atual; E/I < 95% = déficit crônico.

**Fontes:**

- Waterlow JC. Classification and definition of protein-calorie malnutrition. BMJ. 1972;3(5826):566-9. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC1785878/) — *fonte não acessada*. Artigo original; não conferido (imagem digitalizada).
- WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards (2006): tabelas LMS oficiais do pacote anthro e algoritmo do próprio pacote. [link](https://www.who.int/tools/child-growth-standards/standards) — *documento oficial*. Medianas de peso-para-estatura e estatura-para-idade (tabelas oficiais).
- Sandler A. The legacy of a standard of normality in child nutrition research. SSM Popul Health. 2021;15:100865. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC8319510/) — *reprodução em artigo aberto*. Waterlow (1972), peso para a estatura: graus 90–80, 80–70 e < 70% da mediana (abaixo de 90% = desnutrição atual). O corte de 95% da estatura para a idade não aparece nessa reprodução.

**Exemplo resolvido:**

- Entradas: age_months = 36, sex = female, weight_kg = 11, length_cm = 88, measurement_position = em_pe
- Cálculo: Menina, 1.096 dias, 88 cm em pé, 11 kg: mediana P/E = 12,1478 kg → 90,55%; mediana E/I = 95,0572 cm → 92,58%. P/E ≥ 90 e E/I < 95 → desnutrição pregressa.
- Resultado: weight_for_height_percent = 90,55, height_for_age_percent = 92,58 · classificação `desnutricao_pregressa`

<a id="necessidade-energetica-infantil"></a>

## Necessidade Energética Infantil

`necessidade-energetica-infantil` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Os 34 valores de kcal/kg/dia conferidos nas Tabelas 4.5 (meninos) e 4.6 (meninas) do relatório FAO/OMS/ONU (2004).

**Fórmula e pontos de corte:** kcal/dia = kcal/kg da tabela (por sexo, idade em anos completos e atividade) × peso.

**Fontes:**

- FAO/WHO/UNU. Human energy requirements: report of a Joint FAO/WHO/UNU Expert Consultation (Roma, 2001). FAO Food and Nutrition Technical Report Series 1, 2004. [link](https://www.fao.org/4/y5686e/y5686e.pdf) — *documento oficial*. Tabelas 4.5 e 4.6: necessidade energética de 1 a 18 anos com atividade leve, moderada e intensa (de 1 a 5 anos, um valor único).

**Ressalvas:**

- De 1 a 5 anos a FAO dá um único valor (atividade moderada); nessa idade o nível de atividade escolhido não altera o resultado.

**Exemplo resolvido:**

- Entradas: age_years = 4,5, sex = male, weight_kg = 17, activity_level = moderada
- Cálculo: Menino de 4,5 anos → 4 anos completos → 77 kcal/kg (Tabela 4.5). 77 × 17 = 1.309 kcal/dia.
- Resultado: kcal_per_kg = 77, kcal_per_day = 1309

<a id="anemia-oms"></a>

## Anemia (OMS)

`anemia-oms` · versão v2 · **Conferido na fonte** (conferido em 24/09/2026)

Cortes de gravidade (Tabela 3) e ajustes da hemoglobina pela altitude da residência (Tabela 4) e pelo tabagismo (Tabela 5) conferidos na diretriz da OMS de 2024, que substitui a de 2011.

**Fórmula e pontos de corte:** Sem anemia / leve / moderada a partir de (g/dL): 6–23 meses 10,5 / 9,5 / 7,0 · 24–59 meses 11,0 / 10,0 / 7,0 · 5–11 anos 11,5 / 11,0 / 8,0 · 12–14 anos 12,0 / 11,0 / 8,0 · mulheres ≥ 15 anos 12,0 / 11,0 / 8,0 · homens ≥ 15 anos 13,0 / 11,0 / 8,0 · gestantes no 1º e 3º trimestres 11,0 / 10,0 / 7,0 · no 2º trimestre 10,5 / 9,5 / 7,0; abaixo do último, grave. Antes de classificar, desconta-se da hemoglobina o ajuste da altitude (0,4 a 3,3 g/dL, de 500 a 4.999 m) e do tabagismo (0,3 a 0,6 g/dL), quando informados.

**Fontes:**

- WHO. Guideline on haemoglobin cutoffs to define anaemia in individuals and populations. Geneva, 2024. [link](https://www.ncbi.nlm.nih.gov/books/NBK602198/) — *documento oficial*. Tabela 2 (cortes de anemia), Tabela 3 (gravidade por grupo, inclusive por trimestre da gestação), Tabela 4 (ajuste por altitude em faixas de 500 m: 0, 4, 8, 11, 14, 18, 21, 25, 29, 33 g/L) e Tabela 5 (tabagismo: 3 g/L para quantidade desconhecida ou < 10 cigarros/dia, 5 g/L para 10–19, 6 g/L para > 20). Os ajustes são subtraídos da hemoglobina observada.
- WHO. Haemoglobin concentrations for the diagnosis of anaemia and assessment of severity. WHO/NMH/NHD/MNM/11.1, 2011. [link](https://iris.who.int/handle/10665/85839) — *documento oficial*. Tabela 1, usada pelo app até a v1: igual à de 2024 exceto 6–59 meses num grupo só (11,0 / 10,0 / 7,0) e gestantes sem distinção de trimestre.

**Ressalvas:**

- A diretriz de 2024 cobre de 6 meses a 65 anos; acima de 65 anos o app usa os cortes de adultos (a de 2011 valia para "15 anos ou mais").
- A Tabela 5 lista < 10, 10–19 e > 20 cigarros/dia; o app põe 20 na última faixa, onde a própria equação da OMS (0,4565 × n − 0,0078 × n²) dá 6 g/L.
- Altitude e tabagismo em branco significam nenhum ajuste; a OMS recomenda ajustar quando se sabe.
- A diretriz não recomenda ajuste por inflamação nem por ancestralidade; a ferritina tem calculadora própria.

**Mudanças:**

- 24/09/2026 (v2): Cortes da OMS 2024: 6–23 meses passou a ter corte próprio (10,5 g/dL) e o 2º trimestre da gestação, 10,5 g/dL (trimestre agora é informado). Incluídos os ajustes por altitude e tabagismo.

**Exemplo resolvido:**

- Entradas: age_years = 40, sex = male, pregnant = não, hemoglobin_g_dl = 14
- Cálculo: Homem de 40 anos, sem ajuste: sem anemia a partir de 13,0 g/dL. 14,0 ≥ 13,0 → sem anemia.
- Resultado: hemoglobin_g_dl = 14, anemia_cutoff_g_dl = 13 · classificação `sem_anemia`

<a id="ferritina-oms"></a>

## Ferritina (OMS)

`ferritina-oms` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Cortes conferidos na Tabela 1 e na recomendação 1.2 da diretriz da OMS de 2020.

**Fórmula e pontos de corte:** Deficiência de ferro se ferritina < 12 µg/L (< 5 anos) ou < 15 µg/L (≥ 5 anos); com infecção ou inflamação < 30 e < 70 µg/L.

**Fontes:**

- WHO. WHO guideline on use of ferritin concentrations to assess iron status in individuals and populations. Geneva, 2020 (ISBN 978-92-4-000012-4). [link](https://www.who.int/publications/i/item/9789240000124) — *documento oficial*. Tabela 1: deficiência de ferro < 12 µg/L de 0 a 59 meses (< 30 com infecção ou inflamação) e < 15 µg/L de 5 anos em diante (< 70 com infecção ou inflamação); gestantes < 15 µg/L no 1º trimestre. Inflamação definida, por exemplo, por PCR > 5 mg/L ou AGP > 1 g/L.

**Ressalvas:**

- Para gestantes a OMS só define corte no 1º trimestre (< 15 µg/L, igual ao do grupo etário). No 2º e 3º trimestres não há corte, e o resultado do app deve ser lido com cautela.
- A mesma tabela traz cortes de risco de sobrecarga de ferro (> 150 µg/L mulheres, > 200 µg/L homens, > 500 µg/L em doentes), que o app não classifica.

**Exemplo resolvido:**

- Entradas: age_years = 35, inflammation = não, ferritin_ng_ml = 10
- Cálculo: 35 anos, sem inflamação → corte 15. 10 < 15 → deficiência de ferro.
- Resultado: ferritin_ng_ml = 10, ferritin_cutoff_ng_ml = 15 · classificação `deficiencia_de_ferro`

<a id="glicemia-diagnostico"></a>

## Diagnóstico Glicêmico

`glicemia-diagnostico` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Todos os critérios conferidos na Tabela 1 e nas recomendações R1 e R5 da diretriz vigente da SBD.

**Fórmula e pontos de corte:** Pré-diabetes / diabetes a partir de: jejum 100 / 126 mg/dL · HbA1c 5,7 / 6,5% · TOTG 1 h 155 / 209 mg/dL · TOTG 2 h 140 / 200 mg/dL. Vale o exame mais alterado.

**Fontes:**

- Sociedade Brasileira de Diabetes. Diretriz Oficial: Diagnóstico de diabetes mellitus e rastreamento do DM tipo 2 (revisão de 09/07/2024). DOI 10.29327/5412848.2024-1. [link](https://diretriz.diabetes.org.br/diagnostico-de-diabetes-mellitus/) — *documento oficial*. Tabela 1 (critérios laboratoriais) e recomendações R1 e R5 (TOTG de 1 hora).

**Ressalvas:**

- Um único exame na faixa de diabetes, sem sintomas, precisa ser repetido para confirmar (R1); por isso o resultado é 'compatível com diabetes'. A glicemia ao acaso ≥ 200 com sintomas (R2) não está no formulário.

**Mudanças:**

- 24/09/2026 (v1): Incluído o TOTG de 1 hora (< 155 normal, 155–208 pré-diabetes, ≥ 209 diabetes) e atualizada a citação para a revisão 2024 da diretriz.

**Exemplo resolvido:**

- Entradas: fasting_glucose_mg_dl = 92, hba1c_percent = 5,4
- Cálculo: Jejum 92 (< 100) e HbA1c 5,4% (< 5,7) → normoglicemia.
- Resultado: fasting_glucose_mg_dl = 92, hba1c_percent = 5,4 · classificação `normoglicemia`

<a id="homa-ir"></a>

## HOMA-IR

`homa-ir` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Corte brasileiro de 2,71 conferido (BRAMS); a constante 405 é a conversão de 22,5 (glicose em mmol/L) para mg/dL, e o 22,5 de Matthews (1985) não foi conferido no texto original.

**Fórmula e pontos de corte:** HOMA-IR = glicemia de jejum (mg/dL) × insulina de jejum (µUI/mL) ÷ 405. Resistência à insulina se > 2,71.

**Fontes:**

- Geloneze B, Vasques ACJ, Stabe CFC et al. HOMA1-IR and HOMA2-IR indexes in identifying insulin resistance and metabolic syndrome: Brazilian Metabolic Syndrome Study (BRAMS). Arq Bras Endocrinol Metab. 2009;53(2):281-7. [link](https://www.scielo.br/j/abem/a/Fb4KV8mksGnjn9LzfQtQRqR/?lang=en) — *texto completo da fonte*. Texto completo: corte de 2,71 identificado antes pelo grupo (Geloneze 2006) e 2,7 no BRAMS.
- Geloneze B, Repetto EM, Geloneze SR et al. The threshold value for insulin resistance (HOMA-IR) in an admixtured population. IR in the Brazilian Metabolic Syndrome Study. Diabetes Res Clin Pract. 2006;72(2):219-20. [link](https://pubmed.ncbi.nlm.nih.gov/16310881/) — *resumo da fonte (PubMed)*. Carta original com o valor de corte.
- Matthews DR, Hosker JP, Rudenski AS et al. Homeostasis model assessment: insulin resistance and beta-cell function from fasting plasma glucose and insulin concentrations in man. Diabetologia. 1985;28(7):412-9. [link](https://pubmed.ncbi.nlm.nih.gov/3899825/) — *resumo da fonte (PubMed)*. Modelo HOMA; o resumo não traz a constante 22,5.

**Exemplo resolvido:**

- Entradas: fasting_glucose_mg_dl = 90, fasting_insulin_uui_ml = 10
- Cálculo: 90 × 10 ÷ 405 = 2,22. Não é maior que 2,71 → sem resistência insulínica.
- Resultado: homa_ir = 2,22 · classificação `sem_resistencia_insulinica`

<a id="perfil-lipidico"></a>

## Perfil Lipídico

`perfil-lipidico` · versão v2 · **Conferido, com ressalvas** (conferido em 24/09/2026)

LDL-c pela equação de Martin/Hopkins, recomendada pela SBC 2025 para todos. A tabela de 180 fatores foi conferida em duas fontes independentes (Tabela 1 da SBC 2017 e o pacote LDLcalc), que coincidem em 179 das 180 células; o artigo original traz a tabela só como imagem. Valores desejáveis conferidos na SBC 2025 (iguais aos de 2017).

**Fórmula e pontos de corte:** Não-HDL-c = CT − HDL-c. LDL-c (Martin/Hopkins) = não-HDL-c − TG ÷ fator, com o fator (mediana da razão TG:VLDL-c) da tabela de 180 células: 30 faixas de TG (7–49 … 400–13.975 mg/dL) × 6 faixas de não-HDL-c (< 100, 100–129, 130–159, 160–189, 190–219, ≥ 220 mg/dL). Com TG > 800 mg/dL o LDL-c não é estimado (avaliar o não-HDL-c). Desejável: CT < 190, HDL-c > 40, TG < 150 (jejum) ou < 175 (sem jejum).

**Fontes:**

- Sociedade Brasileira de Cardiologia. Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose 2025. Arq Bras Cardiol. 2025. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC12674852/) — *texto completo da fonte*. Recomendação forte a favor de Martin/Hopkins para todos; com TG > 800 mg/dL o LDL-c pode sair subestimado e deve-se avaliar o não-HDL-c. Tabela de valores referenciais: CT < 190, TG < 150 (jejum) / < 175 (sem jejum), HDL-c > 40.
- Martin SS, Blaha MJ, Elshazly MB et al. Comparison of a novel method vs the Friedewald equation for estimating low-density lipoprotein cholesterol levels from the standard lipid profile. JAMA. 2013;310(19):2061-8. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC4226221/) — *texto completo da fonte*. Equação LDL-c = não-HDL-c − TG ÷ fator, com o fator igual à mediana da razão TG:VLDL-c em cada célula da tabela de 180 células (Figura 2, publicada como imagem).
- Faludi AA et al. Atualização da Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose 2017. Arq Bras Cardiol. 2017;109(2 Supl 1):1-76. [link](https://www.scielo.br/j/abc/a/whBsCyzTDzGYJcsBY7YVkWn/?lang=pt) — *texto completo da fonte*. Tabela 1 (texto): os 180 fatores de Martin/Hopkins por faixa de TG e de não-HDL-c.
- Pacote LDLcalc 2.1 para R (CRAN): tabela dfCell180 de Martin/Hopkins no arquivo R/sysdata.rda. [link](https://cran.r-project.org/src/contrib/Archive/LDLcalc/) — *reprodução em artigo aberto*. Os 180 fatores e as faixas de TG e de não-HDL-c, comparados célula a célula com a Tabela 1 da SBC 2017.

**Ressalvas:**

- Na célula TG 84–87 × não-HDL-c 190–219 mg/dL a Tabela 1 da SBC 2017 traz 4,3; o pacote LDLcalc e outra implementação independente de código aberto (github.com/alperyayla1, aplicativo de estimativa de LDL-c) trazem 4,4. O app usa 4,4. A diferença no LDL-c é de no máximo 0,5 mg/dL.
- As faixas são de valores inteiros; valores com decimais caem na faixa cujo limite inferior alcançam (TG 49,5 → faixa 7–49).
- O HDL-c tem de ser menor que o colesterol total; caso contrário o cálculo é recusado.
- Metas de LDL-c e de não-HDL-c dependem da categoria de risco cardiovascular, que este cálculo não avalia.

**Mudanças:**

- 24/09/2026 (v1): Referência dos valores desejáveis atualizada para a SBC 2025 (valores iguais).
- 24/09/2026 (v2): LDL-c passou de Friedewald (TG ÷ 5, só com TG < 400) para Martin/Hopkins (tabela de 180 fatores, até TG 800), como recomenda a SBC 2025. O fator usado aparece no resultado.

**Exemplo resolvido:**

- Entradas: total_cholesterol_mg_dl = 180, hdl_mg_dl = 55, triglycerides_mg_dl = 100, fasting = sim
- Cálculo: Não-HDL-c = 180 − 55 = 125 (faixa 100–129); TG 100 (faixa 97–100) → fator 5,1. LDL-c = 125 − 100 ÷ 5,1 = 125 − 19,61 = 105,39. CT < 190, HDL-c > 40 e TG < 150 → perfil desejável.
- Resultado: ldl_mg_dl = 105,39, martin_factor = 5,1, non_hdl_mg_dl = 125 · classificação `perfil_desejavel`

<a id="ckd-epi-2021"></a>

## CKD-EPI 2021

`ckd-epi-2021` · versão v1 · **Conferido na fonte** (conferido em 24/09/2026)

Coeficientes conferidos no texto completo do artigo (NEJM 2021) e categorias G1–G5 na diretriz KDIGO 2024.

**Fórmula e pontos de corte:** TFGe = 142 × min(Scr/κ; 1)^α × max(Scr/κ; 1)^−1,200 × 0,9938^idade × 1,012 (mulher). κ = 0,7 (M) / 0,9 (H); α = −0,241 (M) / −0,302 (H). G1 ≥ 90 · G2 60–89 · G3a 45–59 · G3b 30–44 · G4 15–29 · G5 < 15.

**Fontes:**

- Inker LA, Eneanya ND, Coresh J et al. New creatinine- and cystatin C-based equations to estimate GFR without race. N Engl J Med. 2021;385(19):1737-49. [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC8822996/) — *texto completo da fonte*. Tabela de coeficientes da equação de creatinina sem raça (142; −0,241/−0,302; −1,200; 0,9938; 1,012) e κ = 0,7 / 0,9.
- KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314 (categorias de TFG G1 a G5). [link](https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf) — *documento oficial*. Categorias de TFG G1 a G5.

**Ressalvas:**

- G1 e G2 só caracterizam doença renal crônica com outro marcador de lesão renal.

**Exemplo resolvido:**

- Entradas: creatinine_mg_dl = 1, age_years = 50, sex = male
- Cálculo: Homem, 50 anos, Scr 1,0: 1,0 ÷ 0,9 = 1,111. 142 × 1 × 1,111^−1,2 × 0,9938^50 = 142 × 0,8812 × 0,7328 = 91,69 → G1.
- Resultado: egfr_ml_min_173m2 = 91,69 · classificação `g1_normal_ou_elevada`

<a id="cockcroft-gault"></a>

## Cockcroft-Gault

`cockcroft-gault` · versão v1 · **Conferido, com ressalvas** (conferido em 24/09/2026)

Redução de 15% para mulheres conferida no resumo; a fórmula (que no artigo está numa figura) foi conferida por equivalência com uma reprodução aberta em unidades SI.

**Fórmula e pontos de corte:** ClCr (mL/min) = (140 − idade) × peso ÷ (72 × Scr em mg/dL) × 0,85 se mulher.

**Fontes:**

- Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41. [link](https://pubmed.ncbi.nlm.nih.gov/1244564/) — *resumo da fonte (PubMed)*. Fórmula para homens adultos e 15% a menos para mulheres.
- Artigo de acesso aberto com a fórmula de Cockcroft-Gault em unidades SI (fatores 1,23 e 1,04 com creatinina em µmol/L). [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC13588138/) — *reprodução em artigo aberto*. Forma SI: (140 − idade) × peso × 1,23 ÷ Scr (µmol/L); 88,4 ÷ 72 = 1,23, equivalente à forma em mg/dL.

**Exemplo resolvido:**

- Entradas: creatinine_mg_dl = 1, age_years = 60, weight_kg = 70, sex = male
- Cálculo: (140 − 60) × 70 ÷ (72 × 1,0) = 77,78 mL/min.
- Resultado: crcl_ml_min = 77,78
