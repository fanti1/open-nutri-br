# ADR 0001 — Fase 2 (Hospitalar/UTI): 14 de 18 calculadoras implementadas

## Status
Implementado (parcial, por decisão deliberada).

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

## Próximos passos
Antes de implementar Penn State/Ireton-Jones/Swinamer/Toronto, verificar os
coeficientes exatos contra a publicação original (não contra fontes
secundárias) e adicionar ao catálogo com o mesmo padrão SRP + testes das
demais calculadoras.

## Outras decisões desta fase
- Todas as novas calculadoras usam `module: 'hospitalar'` e
  `category: 'triagem_risco'` ou `'suporte_nutricional'`.
- ~~Marcadas como `is_premium: true`~~ — revogado pela ADR 0003: todas as
  funcionalidades são abertas a todos; o conceito de premium foi removido.
- `holliday-segar` é a primeira calculadora do catálogo com
  `lifeStages: [Child, Adult, Elderly]` — demonstra que o sistema de faixa
  etária reflete corretamente quando um método realmente se aplica a todas as idades.
