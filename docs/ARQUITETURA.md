# Arquitetura

> Parte da documentação do [OpenNutri BR](../README.md). Veja também: [Guia de uso](guia/README.md) · [Arquitetura](ARQUITETURA.md) · [Confiabilidade](CONFIABILIDADE.md) · [Privacidade](PRIVACIDADE.md) · [Desenvolvimento](DESENVOLVIMENTO.md)

```
mobile/     App Expo/React Native (Android, iOS, web) — o produto, 100% offline
backend/    Laravel: implementação de referência das fórmulas e gerador do catálogo do app
shared/     Vetores de teste das calculadoras (calculators-spec/) e auditoria científica de cada método (auditoria/)
docs/       Decisões de arquitetura (ADRs), METODOS.md (auditoria pública) e documentação da tabela TACO
```

## App (`mobile/`)

```
app/                   Telas (expo-router): abas Início, Calculadoras, Pacientes, Agenda, Mais;
                       Sobre, Novidades, Licenças, Central de ajuda e Relatar um problema
src/
├── data/              SQLite local: migrações, repositórios, serviços (agenda, tarefas, backup,
│                      bloqueio) e as tabelas oficiais embarcadas — who/ (curvas da OMS) e taco.json
├── domain/            Motor de cálculo (espelho do backend), curvas da OMS, TACO, nutrição,
│                      formulários gerados do catálogo, perfil do cálculo e auto-preenchimento
├── features/          Componentes por funcionalidade (pacientes, calculadoras, planos, agenda…)
├── lib/, theme/, ui/  Utilitários, tema claro/escuro e design system
```

- **Local-first e reativo**: toda escrita avisa quais tabelas mudaram (`notifyChange`) e as telas inscritas (`useLiveQuery`) recarregam na hora.
- **Formulários sem código por calculadora**: os campos, opções e faixas vêm das regras de validação do catálogo (`schemaToFields`), as mesmas que o backend aplica.
- **Calculadora = fórmula + classificador**, funções puras ligadas por `makeCalculator` (no backend, `AbstractCalculator`), que também guarda a saída.
- **Tabelas carregadas sob demanda**: curvas da OMS e TACO só são lidas quando usadas.
- **Testes sem mocks do Expo**: os repositórios rodam sobre SQLite real (sql.js).

## Backend (`backend/`)
API em `/api/v1` (catálogo e cálculo públicos; pacientes, sessões e conta autenticados) e os comandos `catalog:export` (gera `mobile/src/data/catalog.json`) e `foods:import-taco`.

## Decisões de arquitetura (ADRs)

Em [`docs/adr/`](adr/):
[0001 Hospitalar/UTI](adr/0001-fase-2-hospitalar-uti.md) ·
[0002 Pediatria](adr/0002-fase-3-pediatria.md) ·
[0003 Dados locais e acesso aberto](adr/0003-dados-locais-e-acesso-aberto.md) ·
[0004 Hematologia e bioquímica](adr/0004-fase-4-hematologia-bioquimica.md) ·
[0005 Extensões de consultório](adr/0005-fase-6-extensoes-consultorio.md) ·
[0006 App 100% offline](adr/0006-app-100-offline.md) ·
[0007 Calculadoras por público](adr/0007-publico-primeiro.md) ·
[0008 Plano alimentar e segurança](adr/0008-plano-alimentar-e-seguranca.md) ·
[0009 Revisão de confiabilidade](adr/0009-revisao-de-confiabilidade.md) ·
[0010 Auditoria científica](adr/0010-auditoria-cientifica.md) ·
[0011 Refatoração de UI/UX](adr/0011-refatoracao-ui-ux.md) ·
[0012 Desempenho](adr/0012-desempenho.md) ·
[0013 Sobre, ajuda, relato de erros e repositório aberto](adr/0013-sobre-ajuda-e-repositorio-aberto.md) ·
[0014 Visual "Vivo"](adr/0014-visual-vivo.md) ·
[0015 Testes ponta a ponta](adr/0015-testes-ponta-a-ponta.md)

O ícone do app tem fonte vetorial em `mobile/assets/icon.svg`: um "O" aberto (*Open*) com cabinho e folha (*Nutri*), nas cores da marca.
