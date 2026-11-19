# ADR 0015 — Testes ponta a ponta no navegador

## Status
Implementado.

## Contexto
O app tinha cerca de 780 testes unitários e de integração (fórmulas, formulários, banco
SQLite real, backup, criptografia). Nenhum deles usava o app como uma pessoa usa:
tocando, digitando, navegando entre telas. Os fluxos do Maestro (Android) exigem
emulador e estavam desatualizados. O pedido foi garantir que o que existe funciona
de verdade e que nada quebre no futuro.

## Decisões
- **Playwright no navegador**, sobre o build web de produção (`expo export`). O app é
  o mesmo código do Android e do iOS (react-native-web), então os fluxos, as telas, o
  banco SQLite e a lógica são os reais. Roda sem janela, local e no CI, sem emulador.
- **Navegador já instalado**: Edge no Windows e Chrome no CI. Nada é baixado.
- **Garantias em todo teste** (fixture comum): falha se houver requisição externa (o app é
  100% offline), erro de JavaScript ou erro no console. Impressão, links externos e área
  de transferência são registrados para o teste conferir, em vez de abrir janelas.
- **Calculadoras pela auditoria**: para cada um dos 55 métodos, o exemplo publicado é
  digitado na tela (perfil, números, opções) e o resultado e a classificação exibidos
  são conferidos. O teste usa os rótulos e a formatação do próprio app.
- **Todas as telas**: a lista de rotas sai da pasta `app/`, então uma tela nova entra no
  teste sozinha. Cada uma é aberta com dados nos temas claro e escuro.
- **Seletores pelo que o leitor de tela anuncia** (papel e nome acessível): o teste também
  vigia a acessibilidade. Um botão sem nome ou dois controles com o mesmo nome quebram o teste.
- **Dados fictícios** restaurados pela própria tela de Backup, como o usuário faria.

## Problemas reais encontrados pelos testes (e corrigidos)
- Exportar PDF (ficha e plano) no navegador imprimia a tela do app, não o relatório. O
  `expo-print` para web ignora o HTML; o app agora imprime o relatório num quadro oculto.
- "Copiar ou compartilhar" falhava sem aviso em navegadores sem compartilhamento nativo;
  agora copia o texto e avisa.
- O menu "Mais opções" deixava o fundo escuro preso sobre a ficha ao navegar para
  "Editar dados" (a animação de saída nunca terminava com a tela oculta). Na web, os
  painéis não animam mais.
- Acessibilidade:
  - o campo de data não dizia qual era;
  - os dias do calendário eram lidos como "2026-11-12";
  - botões tinham os caracteres dos ícones no nome;
  - a tela de Backup tinha dois campos "Senha do backup";
  - a linha do plano tinha o mesmo nome do botão de criar um plano;
  - o cartão de atendimento não tinha rótulo.

## Limites
Ficam para o teste no aparelho (Maestro ou manual):
- notificações e lembretes;
- digital ou rosto;
- folha de compartilhamento nativa;
- geração do PDF nativo;
- seletor de arquivos do Android;
- comportamento ao trocar de app (bloqueio por tempo em segundo plano).

## Consequências
- `npm run test:e2e` faz parte das verificações antes de enviar (CONTRIBUTING, regra 11)
  e do CI.
- Funcionalidade nova ganha teste em `mobile/e2e/web/specs/`.
- Os fluxos do Maestro precisam ser revistos antes de voltar a ser usados.
