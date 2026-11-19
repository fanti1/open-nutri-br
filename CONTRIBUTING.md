# Como contribuir

Obrigado por querer melhorar o OpenNutri BR. Este é um app clínico: um erro numa calculadora é um risco para o paciente, não só um bug. Por isso as regras abaixo são mais rígidas do que de costume, e valem para qualquer contribuição, pequena ou grande.

Ao participar, você concorda com o [Código de Conduta](CODE_OF_CONDUCT.md).

## Formas de ajudar

- **Relatar um problema**: no app, em **Mais → Relatar um problema** (o relato já sai com as informações técnicas), ou pelo [formulário de problema](https://github.com/fanti1/open-nutri-br/issues/new?template=bug.yml).
- **Sugerir uma melhoria**: pelo [formulário de sugestão](https://github.com/fanti1/open-nutri-br/issues/new?template=sugestao.yml).
- **Apontar uma divergência científica**: um coeficiente, corte ou classificação que não bate com a fonte, pelo [formulário de divergência](https://github.com/fanti1/open-nutri-br/issues/new?template=divergencia-cientifica.yml). Cite a fonte com página, tabela ou equação.
- **Melhorar os guias**: os textos de [`docs/guia/`](docs/guia/) aparecem também na Central de ajuda do app.
- **Código**: veja abaixo.

Falhas de segurança **não** vão em issue pública: veja [SECURITY.md](SECURITY.md).

## Regras do projeto

1. **Fonte primária ou nada.** Todo coeficiente, tabela e ponto de corte vem da publicação original ou da diretriz oficial, citada na calculadora. Na dúvida, a calculadora fica de fora e a lacuna vai para uma ADR.
2. **Regra de negócio não muda "de passagem".** Uma correção clínica (corte, coeficiente, classificação) é uma decisão própria, com fonte conferida, vetor de teste novo e entrada em "mudanças" na auditoria do método. Um PR de outra natureza (interface, desempenho, documentação) não altera fórmulas.
3. **Toda calculadora tem**: implementação PHP e TypeScript, vetores em `shared/calculators-spec/` calculados por um script independente das duas, público validado (`lifeStages`), referência e o registro de auditoria em `shared/auditoria/<slug>.json` (fontes, grau de acesso, o que foi conferido, ressalvas, exemplo). Depois, `php artisan catalog:export`.
4. **Mudou o resultado de uma fórmula? Suba a `version`** da calculadora. Cálculos salvos guardam a versão com que foram feitos.
5. **Classifique o valor exibido** (já arredondado com `round2`/`round()`), e compare valores calculados com os cortes por `Cutoff`/`cutoff.ts`.
6. **Validação só com regras que o app entende** (`required`, `nullable`, `numeric`, `integer`, `boolean`, `in`, `min`, `max`, `between`, `required_if`, `required_without_all`). Uma regra nova exige suporte no formulário do app; o teste do catálogo avisa.
7. **Migrações publicadas nunca são editadas**: crie a próxima (`mobile/src/data/db/migrations.ts`).
8. **O app não faz requisições de rede.** Nada de SDK de analytics, anúncios ou telemetria. Links externos só abrem o navegador, por ação do usuário.
9. **Nomenclatura própria**: nomes de telas e seções são do OpenNutri BR; nomes de métodos científicos são os da literatura.
10. **Acessível desde o início**: botões com papel e rótulo (`IconButton` para ícones tocáveis), alvos de 44 pt, nada que dependa só de cor, cores de `colors`/`withAlpha`, avisos com `Callout`. Veja a [declaração de acessibilidade](docs/guia/08-acessibilidade.md).
11. Antes de enviar: `npm test`, `npx tsc --noEmit`, `npm run lint` e `npm run test:e2e` no app; `php artisan test` no backend. Funcionalidade nova ganha teste ponta a ponta em `mobile/e2e/web/specs/`.

## Fluxo de um pull request

1. Abra uma issue antes de mudanças grandes, para combinar a abordagem.
2. Crie um ramo a partir do principal e faça commits pequenos, com mensagens em português que digam o que mudou e por quê.
3. Rode as verificações (regra 11). O CI roda as mesmas no PR.
4. Descreva no PR o que mudou, como você testou e, se mexer em tela, inclua um print (tema claro e escuro, quando fizer diferença).
5. Se a mudança for visível para quem usa o app, acrescente uma linha em **Não lançado** no [CHANGELOG.md](CHANGELOG.md) e rode `node scripts/build-changelog.mjs` em `mobile/`.

Como rodar o app e o backend, os arquivos gerados e os prints: [docs/DESENVOLVIMENTO.md](docs/DESENVOLVIMENTO.md). Arquitetura e decisões: [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Licença das contribuições

O código do OpenNutri BR é distribuído sob a [GPL-3.0-or-later](LICENSE), e a documentação e os textos sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt-br). Ao enviar uma contribuição, você concorda que ela seja distribuída sob essas mesmas licenças e declara que tem o direito de fazê-lo.

> Não inclua, em issues, PRs, prints ou vetores de teste, dados que identifiquem pacientes reais.
