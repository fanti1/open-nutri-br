# Confiabilidade dos cálculos e auditoria científica

> Parte da documentação do [OpenNutri BR](../README.md). Veja também: [Guia de uso](guia/README.md) · [Arquitetura](ARQUITETURA.md) · [Confiabilidade](CONFIABILIDADE.md) · [Privacidade](PRIVACIDADE.md) · [Desenvolvimento](DESENVOLVIMENTO.md)

Um erro numa calculadora clínica é um risco para o paciente, não só um bug. Por isso:

- **Nenhuma constante de memória.** Coeficientes, tabelas e pontos de corte são conferidos na fonte primária (artigo, diretriz ou tabela oficial) antes de entrar; o que não pôde ser conferido fica de fora e é registrado numa ADR (ex.: Ireton-Jones).
- **Duas implementações, os mesmos vetores.** Cada calculadora existe em PHP (`backend/app/Domain/Calculators`) e em TypeScript (`mobile/src/domain/calculators`). Os casos de teste de `shared/calculators-spec/*.json` — com valores calculados por um script independente das duas, e gabarito da própria OMS nas curvas de crescimento — rodam no PHPUnit e no Jest e têm de bater **exatamente**.
- **Mesmo arredondamento nos dois lados.** O app usa um porte fiel do `round()` do PHP 8.4 (meio para longe do zero, tratando o valor como o decimal digitado), então app e backend concordam até a última casa — inclusive quando o resultado cai exatamente num ponto de corte. Um teste diferencial com cerca de 450 mil entradas (aleatórias e em grade densa perto dos cortes) não encontrou nenhuma divergência (ADR 0009).
- **Cortes imunes a ponto flutuante.** Um valor calculado é comparado com o corte com tolerância de 1e-9 (`Cutoff`/`cutoff.ts`): 76,8 kg / 1,60 m² é IMC 30, não 29,999999999999993.
- **Testado pelo caminho da tela.** Os mesmos vetores também são digitados no formulário gerado do catálogo (texto, vírgula decimal, opções) antes de calcular. O formulário aplica as mesmas faixas de validação do backend, e um teste falha se o catálogo usar uma regra de validação que o app não saiba aplicar.
- **Nada de NaN na tela.** Um resultado que não seja número finito nunca é exibido nem salvo; aparece uma mensagem pedindo para conferir os dados.
- **Versão da fórmula.** Todo cálculo salvo guarda `formula_version`; mudar uma fórmula exige subir a versão, e resultados antigos não são recalculados.
- **Faixa etária validada.** Cada método declara para quais públicos foi validado; o app avisa quando o paciente está fora dela.

## Auditoria científica pública

Cada um dos 55 métodos foi confrontado com a fonte (ADR 0010), e o resultado é aberto a qualquer pessoa:

- **No app**: em cada calculadora, "Sobre o método e referência" mostra a fórmula e os pontos de corte usados, cada fonte com o que foi conferido nela e o grau de acesso (texto completo, documento oficial, resumo, reprodução em artigo aberto ou não acessada), ressalvas, mudanças e um **exemplo resolvido** que dá para refazer à mão. Métodos com conferência pendente ou divergência mostram um aviso antes do formulário. Em Mais → Referências e auditoria está o panorama.
- **No repositório**: [docs/METODOS.md](METODOS.md), gerado dos mesmos dados (`shared/auditoria/*.json`).
- **Verificável**: o exemplo publicado de cada método é um vetor de teste — o PHPUnit e o Jest confirmam que as duas implementações dão exatamente o resultado publicado, e o Jest faz isso também digitando o exemplo no formulário do app.
- **Contestável**: o modelo de issue "Divergência científica" recebe apontamentos de qualquer usuário (método, fonte com página/tabela, valor esperado).

Situação em 24/09/2026: **31 conferidos na fonte · 19 conferidos com ressalvas** (parte conferida em resumo ou em reprodução aberta) **· 5 com conferência pendente** (Gómez, Waterlow, % de perda de peso de Blackburn, PG-SGA SF e PNI: a fonte original é fechada ou só existe como imagem digitalizada) **· nenhuma divergência**. As divergências encontradas foram corrigidas com fonte conferida, vetor de teste novo e versão nova da fórmula (ADR 0010): VCT pelo PAL da FAO, proteína e líquidos com meta escolhida pelo profissional, classificação global da ASG pelo avaliador, LDL-c por Martin/Hopkins, anemia pela OMS 2024, RCQ com "≥" da OMS 2008, e retiradas as classificações sem fonte (relação kcal:N da parenteral e faixas do PNI). Nada foi alterado de memória: cada registro diz o que falta e por quê.

> A auditoria torna a conferência rápida e objetiva, mas não substitui a revisão por um nutricionista responsável antes do uso assistencial.
