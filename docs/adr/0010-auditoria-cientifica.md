# ADR 0010 — Auditoria científica pública de todos os métodos

## Status
Implementado. A auditoria de 24/09/2026 cobre os 55 métodos; o resultado de
cada um está em `shared/auditoria/<slug>.json`, no app ("Sobre o método e
referência" e Mais → Referências e auditoria) e em [docs/METODOS.md](../METODOS.md).

## Contexto
Pedido do produto: garantir que todos os métodos estejam de acordo com a
ciência, de forma que os próprios usuários possam conferir.

"Garantir" aqui é um método verificável, não uma promessa: cada coeficiente,
ponto de corte e classificação é confrontado com a fonte; o que foi conferido,
onde e com que grau de acesso fica registrado e visível; o que não pôde ser
conferido fica marcado como tal — nada é completado de memória (regra da ADR
0001). Como ferramenta clínica, o app deve passar também pela revisão de um
nutricionista antes do uso assistencial; a auditoria existe para tornar essa
revisão (e a de qualquer usuário) rápida e objetiva.

## Como foi feito
- Fontes buscadas pela API oficial do PubMed/PubMed Central (resumos e textos
  completos abertos), nos sites oficiais (FAO, NICE, BAPEN, MNA/Nestlé, SBD,
  SBC, KDIGO, ESPEN, OMS, DATASUS/SISVAN, SciELO, Europe PMC e CRAN) e, quando
  o original é fechado, em reproduções em artigos de acesso aberto.
- Grau de acesso registrado por fonte: texto completo, documento oficial,
  resumo, reprodução em artigo aberto ou fonte não acessada. Os documentos da
  OMS (IRIS) foram baixados pela API do repositório.
- Situação de cada método: **conferido** (tudo conferido em fonte primária ou
  oficial), **conferido com ressalvas** (parte por resumo ou reprodução, ou a
  fonte é ambígua), **pendente** (algo não pôde ser conferido), **divergente**
  (o app não corresponde à fonte citada ou à diretriz vigente).

## Resultado
Conferidos: 31 · com ressalvas: 19 · pendentes: 5 · divergentes: 0.

### Corrigido nesta auditoria (fonte conferida, vetor de teste novo)
| Método | O que a fonte diz | Mudança |
|---|---|---|
| CONUT | Tabela I: colesterol 140–180 mg/dL = 1 ponto | 180 exato passou de 0 para 1 ponto (v2) |
| Relação cintura-estatura | NICE 1.9.11: saudável é 0,4–0,49 | < 0,4 deixou de ser "saudável" (v2) |
| Relação cintura-quadril | OMS 2008, Tabela A1: ≥ 0,90 (H) / ≥ 0,85 (M) | O valor exato do corte passou a ser risco aumentado (v2) |
| % de gordura (Deurenberg) | Até 15 anos vale outra equação | Idade mínima 16 anos |
| IMC-para-idade 5–19 | SISVAN, Quadro 13: 19 a 1 m – 19 a 11 m usam os valores de 19 anos | Faixa aceita até 239 meses |
| Diagnóstico glicêmico | SBD (revisão 2024), Tabela 1, R1 e R5 | Incluído o TOTG de 1 h (155 / 209 mg/dL); citação atualizada |
| Distribuição de macros | Uma distribuição reparte o VCT inteiro | Soma diferente de 100% é recusada |
| Valor calórico total | FAO/OMS/ONU, Tabela 5.3: PAL 1,40–2,40 | Fatores 1,2–1,9 (sem fonte) trocados pelo PAL escolhido, com a categoria de estilo de vida (v2) |
| Necessidades proteicas | ESPEN: 1,3 g/kg (UTI); ≥ 1,0 g/kg (polimórbidos, idosos) | Meta em g/kg escolhida pelo profissional, com as recomendações como guia (v2) |
| Ingestão de líquidos | 30–35 mL/kg não está na diretriz citada; ESPEN geriatria: ≥ 1,6 / 2,0 L/dia | Volume em mL/kg escolhido pelo profissional (v2) |
| ASG (Detsky) | A classificação é o julgamento do avaliador | Classificação global informada pelo avaliador, não mais a categoria mais frequente (v2) |
| Perfil lipídico | SBC 2025: Martin/Hopkins para todos; com TG > 800, avaliar o não-HDL-c | LDL-c por Martin/Hopkins (tabela de 180 fatores conferida na SBC 2017 e no pacote LDLcalc; 179 de 180 células iguais, a diferente documentada) (v2) |
| Anemia | OMS 2024, Tabelas 3, 4 e 5 | Cortes de 6–23 meses e do 2º trimestre; trimestre informado; ajuste por altitude e tabagismo (v2) |
| Nutrição parenteral | Faixa de 100–150 kcal/g N sem fonte conferida | Relação mostrada sem classificação (v2) |
| PNI | Faixas < 30 / 30–59 / ≥ 60 sem fonte; citação era de outra revista | Índice sem classificação; citação corrigida (Am J Surg) (v2) |
| MNA-SF | As três categorias são de Kaiser et al. (2009) | Citação corrigida |
| Fórmula de bolso | ESPEN: 20–25 (UTI), 27 (polimórbidos), 30 kcal/kg (idosos) | Citação atualizada |
| Peso ideal | Devine usa a estatura | Descrição "pelo IMC" corrigida |

A API passou a responder 422 (e não 500) para combinações de entrada que não
permitem calcular (`IncompleteInputsException`), como HDL-c maior ou igual ao
colesterol total ou gestante sem o trimestre.

Depois das correções, o teste diferencial da ADR 0009 rodou de novo: 165 mil
entradas aleatórias (todas as calculadoras) e 105 mil numa grade densa em
torno dos cortes novos (faixas de Martin/Hopkins, cortes e ajustes da anemia,
limites de PAL, RCQ). Nenhuma diferença entre PHP e TypeScript, nem nos
valores, nem na classificação, nem em quais entradas são recusadas.

### Pendentes (fonte não acessível nesta auditoria)
Gómez e Waterlow (artigos originais só como imagem digitalizada; a reprodução
de Gómez traz limites de faixa que não coincidem exatamente com os do app),
% de perda de peso (tabela de Blackburn, 1977), PG-SGA SF (formulário oficial)
e PNI (reproduções divergem no coeficiente da transferrina). Cada registro diz
exatamente o que falta; nada foi mudado sem o texto original.

## Como a auditoria é mantida
- Fonte única: `shared/auditoria/<slug>.json`. O `php artisan catalog:export`
  embarca a auditoria no catálogo do app e gera `docs/METODOS.md`; um teste
  falha se algum dos dois estiver desatualizado.
- O exemplo resolvido de cada método aponta um caso de
  `shared/calculators-spec/`: o PHPUnit e o Jest verificam que as duas
  implementações dão exatamente o resultado publicado — no Jest, também
  digitando o exemplo no formulário do app.
- Toda calculadora precisa de auditoria (teste), e métodos não totalmente
  conferidos precisam dizer o que falta.
- Qualquer pessoa pode contestar um método pelo modelo de issue
  "Divergência científica" (`.github/ISSUE_TEMPLATE`).
- Mudança de regra clínica: só com fonte conferida, vetor de teste novo,
  `version` da calculadora aumentada quando o resultado muda, e o registro de
  auditoria atualizado (inclusive a lista de mudanças).
