# Guia de uso do OpenNutri BR

Estes guias também estão dentro do app, em **Mais → Central de ajuda**, e funcionam sem internet.

1. [Primeiros passos](01-primeiros-passos.md): primeiro acesso, abas, uso sem internet
2. [Calculadoras](02-calculadoras.md): público, perfil do cálculo, resultado, referências
3. [Pacientes e atendimentos](03-pacientes.md): ficha, medidas, evolução, arquivos, PDF
4. [Plano alimentar e recordatório 24 h](04-plano-alimentar.md): TACO, totais, metas, PDF
5. [Agenda e tarefas](05-agenda-e-tarefas.md): compromissos, lembretes, checklist
6. [Backup, restauração e bloqueio](06-backup-e-seguranca.md): Google Drive, senha, PIN
7. [Privacidade e LGPD](07-privacidade.md): onde ficam os dados, direitos do paciente
8. [Acessibilidade](08-acessibilidade.md): declaração de acessibilidade e limitações conhecidas
9. [Perguntas frequentes](09-perguntas-frequentes.md)

## Para quem escreve os guias

Cada arquivo `NN-nome.md` vira um artigo da Central de ajuda do app. Depois de editar, rode `node scripts/build-help.mjs` em `mobile/`; um teste falha se o app estiver com a versão antiga.

O app entende um Markdown simples:

- a primeira linha é `<!-- palavras-chave: ... -->`, com termos que a pessoa poderia buscar;
- o título vem num `#`, seguido de um parágrafo de resumo, e as seções em `##` e `###`;
- também são aceitos parágrafos, listas com `-` ou `1.`, avisos com `>`, **negrito** e links (no app, o link vira texto).

Tabelas, blocos de código e imagens não aparecem no app: o conversor recusa tabelas e blocos de código, e ignora imagens.
