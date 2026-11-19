## O que muda e por quê

<!-- Link para a issue, se houver: "Resolve #123". -->

## Como foi testado

<!-- Testes novos, telas conferidas (Android, iOS, navegador; tema claro e escuro). Prints ajudam. -->

## Checklist

- [ ] `npm test`, `npx tsc --noEmit`, `npm run lint` e `npm run test:e2e` passam em `mobile/`; `php artisan test` passa em `backend/` (se mexeu nele).
- [ ] Funcionalidade nova ou alterada tem teste ponta a ponta em `mobile/e2e/web/specs/`.
- [ ] Não altera fórmula, ponto de corte ou classificação **ou** é uma correção clínica com fonte conferida, vetor de teste novo, `version` da calculadora atualizada e entrada em "mudanças" na auditoria.
- [ ] Não adiciona requisição de rede, analytics, anúncios ou telemetria.
- [ ] Telas novas com rótulos e papéis para leitor de tela, alvos de 44 pt e nada que dependa só de cor.
- [ ] Mudança visível para quem usa o app registrada em "Não lançado" no `CHANGELOG.md` (e `node scripts/build-changelog.mjs`).
- [ ] Nenhum dado de paciente real em código, testes ou prints.
