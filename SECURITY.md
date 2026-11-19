# Segurança

O OpenNutri BR guarda dados de saúde, que são dados pessoais sensíveis. Falhas de segurança são tratadas com prioridade.

## Como relatar uma falha

**Não abra uma issue pública.** Use o relato privado do GitHub: na aba **Security** do repositório, toque em **Report a vulnerability** ([link direto](https://github.com/fanti1/open-nutri-br/security/advisories/new)). No app, o caminho é **Mais → Sobre o OpenNutri BR → Falha de segurança**.

Conte, se puder:

- a versão do app e o sistema (Android, iOS ou navegador);
- o que a falha permite (ex.: ver fichas sem o PIN, abrir um backup sem a senha);
- os passos para reproduzir, com dados inventados.

O relato fica visível só para quem mantém o projeto. A correção sai numa versão nova, com crédito a quem relatou (se quiser), e os detalhes da falha só são publicados depois que houver versão corrigida.

## Escopo

Interessa especialmente:

- **Bloqueio do app**: contornar o PIN ou a biometria, ou ver o conteúdo das telas enquanto o app está bloqueado.
- **Backup com senha**: abrir, alterar sem detecção ou enfraquecer a cifra (AES-256-GCM com chave PBKDF2-SHA256).
- **Restauração**: um arquivo de backup adulterado que apague ou corrompa dados, injete SQL ou trave o app.
- **Saída de dados**: qualquer requisição de rede feita pelo app, ou dado de paciente que vá parar no relato de problema.
- **Backend de referência** (`backend/`), se for hospedado: autenticação, exportação e exclusão de conta.

Fora do escopo: aparelho com root ou jailbreak, acesso físico ao aparelho desbloqueado com o app aberto, e a falta de cifra do banco local, que é uma limitação conhecida e documentada em [docs/PRIVACIDADE.md](docs/PRIVACIDADE.md).

## Versões com suporte

Só a versão mais recente recebe correções de segurança. Veja as versões em [CHANGELOG.md](CHANGELOG.md).
