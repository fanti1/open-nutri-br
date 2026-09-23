# ADR 0001 — Fase 2 (Hospitalar/UTI): 17 de 18 calculadoras implementadas

## Status
Implementado. Ireton-Jones segue fora por falta de fonte primária verificável
(ver "Atualização").

## Contexto
O catálogo científico do plano listava 18 métodos para a Fase 2 (Hospitalar/UTI),
divididos em Triagem/Diagnóstico (9) e Necessidades/Suporte Nutricional (9).

## Decisão
Implementamos 14: todos os de triagem/diagnóstico (NRS-2002, MUST, MNA-SF,
ASG/Detsky, PG-SGA SF, GLIM, CONUT, PNI, mNUTRIC) e 5 de suporte nutricional
(Curreri, Balanço Nitrogenado, Holliday-Segar, e dois calculadores concretos de
apoio — relação kcal não-proteica:N para Nutrição Parenteral, e taxa de infusão
para Dieta Enteral).

**Deixamos de fora, por enquanto**: Penn State Equation, Ireton-Jones Equation,
Swinamer Equation e Fórmula de Toronto (queimados).

## Por quê
Essas 4 equações são regressões publicadas com coeficientes numéricos
específicos (não são somas de escores categóricos como NRS-2002/MUST/CONUT).
Não temos confiança suficiente, sem consultar a publicação original de cada
uma, de que os coeficientes lembrados de memória estão corretos — e usar um
coeficiente errado numa ferramenta clínica é um risco real de segurança do
paciente, não apenas um bug de software. Preferimos documentar a lacuna
explicitamente a arriscar publicar uma fórmula sutilmente incorreta.

Nutrição Parenteral e Dieta Enteral, no catálogo original, eram descritas como
"guidelines"/protocolos, não fórmulas. Substituímos por duas calculadoras
concretas e seguras (aritmética simples, sem coeficientes de regressão):
relação kcal-não-proteica:N e taxa de infusão enteral.

ASG/Detsky e PG-SGA SF também não são fórmulas de regressão — são
instrumentos de pontuação/julgamento estruturado — e foram implementados com
a devida ressalva no código sobre serem simplificações de apoio à decisão,
não substitutos do julgamento clínico.

## Atualização (set/2026): 3 das 4 implementadas após conferência
Os coeficientes foram conferidos nos resumos originais (PubMed, via NCBI
E-utilities) e adicionados com `category: 'gasto_energetico'`:

- **Swinamer** (`swinamer`) — Crit Care Med 1990 (PMID 2344758):
  945·SC − 6,4·idade + 108·T + 24,2·f + 817·VC − 4349.
- **Toronto** (`toronto`) — Allard et al., JPEN 1990 (PMID 2112617):
  −4343 + 10,5·%SCQ + 0,23·ingestão + 0,84·Harris-Benedict + 114·T − 4,5·dias.
  A ingestão e o Harris-Benedict são informados pelo profissional: o resumo não
  diz qual versão de Harris-Benedict foi usada, e o app não presume.
- **Penn State** (`penn-state`) — escolhe a versão automaticamente:
  2003b (0,96·Mifflin + 31·Ve + 167·Tmax − 6212; transcrita da revisão
  PMC7520823) ou 2010 para ≥ 60 anos **e** IMC ≥ 30
  (0,71·Mifflin + 85·Tmax + 64·Ve − 3085; resumo original PMID 19011147,
  validada em PMID 21378256). A classificação informa qual versão foi usada.

**Ireton-Jones continua de fora.** A equação de 1992 (PMID 1618877) teve um
erro estatístico reconhecido e foi revista (Nutr Clin Pract 2002,
PMID 16214963), mas a revisão não tem resumo publicado e as transcrições
secundárias divergem no coeficiente de queimadura (804 × 840). Sem a fonte
primária para desempatar, não publicamos.

## Outras decisões desta fase
- Todas as novas calculadoras usam `module: 'hospitalar'` e
  `category: 'triagem_risco'` ou `'suporte_nutricional'`.
- ~~Marcadas como `is_premium: true`~~ — revogado pela ADR 0003: todas as
  funcionalidades são abertas a todos; o conceito de premium foi removido.
- `holliday-segar` é a primeira calculadora do catálogo com
  `lifeStages: [Child, Adult, Elderly]` — demonstra que o sistema de faixa
  etária reflete corretamente quando um método realmente se aplica a todas as idades.
