# Privacidade, segurança e LGPD

> Parte da documentação do [OpenNutri BR](../README.md). Veja também: [Guia de uso](guia/README.md) · [Arquitetura](ARQUITETURA.md) · [Confiabilidade](CONFIABILIDADE.md) · [Privacidade](PRIVACIDADE.md) · [Desenvolvimento](DESENVOLVIMENTO.md)

## Onde ficam os dados
- Pacientes, atendimentos, cálculos, arquivos, planos alimentares, agenda e tarefas ficam **só no aparelho**, num banco SQLite local.
- O app não tem servidor, conta, telemetria, anúncios nem analytics, e não faz nenhuma requisição de rede: calculadoras, curvas da OMS e TACO estão dentro dele (conferido em teste no navegador: nenhuma requisição externa).
- A única saída de dados é iniciada pelo profissional: backup, PDF da ficha ou do plano, e arquivos compartilhados — para onde ele escolher.
- **Relatar um problema** também é iniciado pelo profissional e não leva dados de pacientes: o app monta o texto na tela (versão, sistema, tamanho da tela e, se ele quiser, os erros registrados) e só abre o navegador numa issue já preenchida no GitHub, ou a folha de compartilhamento. Nada é enviado sem que ele revise e confirme no destino.
- Os erros inesperados ficam registrados **só no aparelho** (os 20 mais recentes: mensagem, trecho da pilha e tela), fora do backup, e podem ser apagados na tela de relato.

## Papéis e base legal
- Dados de saúde são **dados pessoais sensíveis** (LGPD, art. 5º, II, e art. 11).
- O **nutricionista é o controlador** dos dados dos seus pacientes: decide o que registrar, por quanto tempo guardar e com quem compartilhar. Quem desenvolve o app não recebe, não acessa e não trata esses dados.
- A base legal é definida pelo profissional — por exemplo, consentimento do titular (art. 11, I) ou tutela da saúde em procedimento realizado por profissional de saúde (art. 11, II, "f"). Observe também o código de ética e as normas de guarda de prontuário do seu conselho profissional.
- No primeiro acesso o profissional lê a política de privacidade e registra o aceite (a versão aceita fica gravada no app).

## Direitos do titular (art. 18)
- **Acesso e portabilidade**: exporte a ficha do paciente em PDF (atendimentos, medidas e cálculos com classificação).
- **Correção**: todos os dados da ficha são editáveis.
- **Eliminação**: excluir a ficha apaga do aparelho todos os atendimentos, cálculos, arquivos e planos do paciente. Compromissos e tarefas ligados a ele continuam na agenda, sem o vínculo — apague-os também se o título ou as observações identificarem o paciente. Backups guardados fora do app continuam com os dados e precisam ser apagados à parte.

## Segurança (art. 46)
- **Bloqueio do app** com PIN de 4 a 6 dígitos e digital/rosto. O PIN nunca é gravado — só um hash PBKDF2-SHA256 com sal aleatório, comparado em tempo constante. Depois de 5 erros seguidos o teclado espera 30 s, e a espera dobra a cada 5 novos erros (até 15 min), mesmo que o app seja fechado. Enquanto bloqueado, o conteúdo fica oculto também para leitores de tela.
- **Backup com senha** (marcado por padrão): AES-256-GCM com chave PBKDF2-SHA256 (200.000 iterações, sal e IV aleatórios a cada backup). Senha errada ou arquivo alterado são recusados. Não existe recuperação de senha, por construção.
- O PIN do aparelho **não vai no backup**: quem esqueceu o PIN reinstala o app e restaura o backup.
- Arquivos temporários de compartilhamento (backup, anexos) não se acumulam no aparelho: a pasta é esvaziada a cada novo envio.
- A restauração valida o arquivo antes de apagar qualquer coisa, só grava colunas que existem no banco e roda numa transação: se algo falhar, os dados atuais ficam como estavam.
- **Limitação conhecida**: o bloqueio protege a interface, não cifra o banco. A proteção do arquivo em repouso fica com o isolamento de apps e a criptografia de disco do Android/iOS — mantenha o aparelho com senha de tela e o sistema atualizado.
- Sem backup, perder o aparelho é perder os dados. O Início lembra de fazer backup quando há pacientes e o último tem mais de 7 dias.

## Backend (se for hospedado)
O app não usa o backend. Se alguém o hospedar, ele já traz: contas com token (Sanctum), registro de consentimento com versão, data e IP, exportação de todos os dados da conta em JSON (portabilidade) e exclusão em duas etapas (a conta para de funcionar na hora e é expurgada após 30 dias, em cascata — exige um *worker* de fila rodando). Rotas públicas (calculadoras e alimentos) não recebem dados pessoais e têm limite de 120 requisições por minuto.

> Este resumo descreve como o software trata os dados; não é parecer jurídico.
