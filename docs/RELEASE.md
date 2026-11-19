# Como lançar uma versão

> Parte da documentação do [OpenNutri BR](../README.md).

As versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/): o terceiro número sobe em correções, o segundo em novidades e o primeiro quando algo deixa de funcionar como antes (ex.: um backup antigo que não pode mais ser restaurado). Mudança de fórmula também sobe a `version` da calculadora (regra 4 do [CONTRIBUTING](../CONTRIBUTING.md)).

A versão do app fica só no `mobile/app.json`; um teste confere que o `package.json` e a última versão do `CHANGELOG.md` batem com ela.

## Passo a passo

Em `mobile/`:

1. **Versão**: `node scripts/bump-version.mjs 1.1.0` atualiza o `app.json` e o `package.json`.
2. **Novidades**: no [CHANGELOG.md](../CHANGELOG.md), mova os itens de "Não lançado" para `## [1.1.0] - AAAA-MM-DD`, escritos para quem usa o app. Depois, `node scripts/build-changelog.mjs`.
3. **Citação**: no [CITATION.cff](../CITATION.cff), atualize `version` e `date-released`.
4. **Licenças**: se as dependências mudaram, `node scripts/build-licenses.mjs`.
5. **Prints**: se a interface mudou, `npm run web` e, em outro terminal, `npm run prints`.
6. **Verificações**: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run test:e2e` e, no backend, `php artisan test`.
7. **Commit e tag**:
   ```
   git commit -am "Versão 1.1.0"
   git tag -a v1.1.0 -m "Versão 1.1.0"
   git push origin main v1.1.0
   ```

O push da tag dispara o workflow [Release](../.github/workflows/release.yml), que:

1. roda as mesmas verificações do CI (testes do app, tipos, lint, ponta a ponta e backend);
2. confere que a tag bate com a versão do `app.json`;
3. gera o projeto Android (`expo prebuild`) e compila o APK assinado com a chave do projeto;
4. cria a GitHub Release `v1.1.0` com as notas da versão tiradas do CHANGELOG (`scripts/release-notes.mjs`), instruções de instalação, o SHA-256 e o APK `OpenNutri-BR-1.1.0.apk` anexado.

O link "Baixar" do README aponta para a última release, então ele se atualiza sozinho.

Para testar o build sem lançar nada: aba **Actions → Release → Run workflow**. O APK sai como artefato do workflow (assinado com a chave de debug se os secrets não estiverem configurados).

Se o workflow falhar depois de criar a tag, corrija, apague a tag (`git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0`) e crie de novo.

## Chave de assinatura do Android (uma vez)

O Android só instala uma atualização por cima da versão anterior se as duas forem assinadas com **a mesma chave**. Por isso a chave é criada uma única vez e guardada com cuidado: perdê-la obriga quem usa o app a desinstalar (e restaurar o backup) para atualizar.

1. Gere a chave (o `keytool` vem com o JDK):
   ```
   keytool -genkeypair -v -storetype PKCS12 -keystore opennutri-release.jks \
     -alias opennutri -keyalg RSA -keysize 4096 -validity 10000
   ```
2. **Guarde o `.jks` e as senhas fora do repositório** (gerenciador de senhas e uma cópia de segurança). O `.gitignore` já ignora `*.jks`.
3. Cadastre os secrets do repositório (**Settings → Secrets and variables → Actions**) ou pelo `gh`:
   ```
   base64 -w0 opennutri-release.jks | gh secret set ANDROID_KEYSTORE_BASE64
   gh secret set ANDROID_KEYSTORE_PASSWORD
   gh secret set ANDROID_KEY_ALIAS --body opennutri
   gh secret set ANDROID_KEY_PASSWORD
   ```
   (No PowerShell, troque o primeiro comando por `[Convert]::ToBase64String([IO.File]::ReadAllBytes("opennutri-release.jks")) | gh secret set ANDROID_KEYSTORE_BASE64`.)

O plugin [`plugins/withReleaseSigning.js`](../mobile/plugins/withReleaseSigning.js) lê essas variáveis no build. Para gerar um APK assinado na sua máquina, exporte as mesmas variáveis (`ANDROID_KEYSTORE_FILE` com o caminho do `.jks`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`) antes de `./gradlew assembleRelease`. Sem elas, o release sai com a chave de debug, que serve só para testes.

## Lojas

- **Play Store**: `eas build --profile production --platform android` gera o AAB. Na primeira publicação, a Play App Signing pode reaproveitar a mesma chave de upload acima.
- **App Store**: `eas build --profile production --platform ios` (exige conta Apple Developer, não exige Mac).

## Configuração do repositório no GitHub (uma vez)

```
gh repo edit fanti1/open-nutri-br \
  --description "App de código aberto para nutricionistas: 55 calculadoras clínicas com auditoria científica, fichas de pacientes e plano alimentar com a TACO. 100% offline, sem conta e sem rastreamento." \
  --homepage "https://github.com/fanti1/open-nutri-br/releases/latest" \
  --add-topic nutricao,nutrition,nutritionist,clinical-calculators,dietetics,taco,who-growth-standards,health,offline-first,privacy,lgpd,react-native,expo,android,laravel,open-source,brasil \
  --enable-discussions=false --enable-wiki=false
```

Também vale ligar em **Settings**: *Private vulnerability reporting* (Security), *Dependabot alerts*, e uma regra de proteção da branch `main` exigindo o CI verde. Para a prévia em redes sociais, envie uma imagem em **Settings → General → Social preview** (sugestão: o ícone com o nome sobre a cor da marca, `#0A7363`, 1280×640).
