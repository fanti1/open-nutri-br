# Desenvolvimento

> Parte da documentação do [OpenNutri BR](../README.md). Veja também: [Guia de uso](guia/README.md) · [Arquitetura](ARQUITETURA.md) · [Confiabilidade](CONFIABILIDADE.md) · [Privacidade](PRIVACIDADE.md) · [Desenvolvimento](DESENVOLVIMENTO.md)

## App

Requer Node.js LTS.

```
cd mobile
npm install
npm run android         # ou: npm run ios (exige Mac) / npm run web
```

Verificações (rode antes de enviar mudanças):

```
npm test                # 741 testes: as 55 calculadoras contra os vetores compartilhados (direto e pelo
                        # formulário), auditoria e exemplos publicados, curvas OMS, TACO, SQLite real,
                        # backup e criptografia, bloqueio, ajuda, relato de problemas, versão e licenças
npx tsc --noEmit        # tipos
npm run lint            # ESLint (expo lint)
```

### Testes ponta a ponta (navegador)

```
npm run test:e2e        # gera o build web de produção, sobe um servidor local e roda os testes
```

São cerca de 200 testes em `e2e/web/specs/`, com [Playwright](https://playwright.dev). Eles usam o Edge (Windows) ou o Chrome instalado, sem janela e sem baixar navegador; para escolher, use `E2E_BROWSER=chrome`. Cobrem:

- primeiro acesso;
- **as 55 calculadoras**, com o exemplo publicado de cada uma digitado na tela e o resultado e a classificação conferidos;
- perfil do cálculo, validação, salvar e calcular para um paciente;
- aba Calculadoras e Início;
- pacientes e ficha completa: atendimentos, evolução, cálculos, arquivos e PDF;
- agenda, tarefas, planos alimentares com a TACO e tabela nutricional;
- backup com e sem senha, e restauração;
- bloqueio com PIN;
- perfil, aparência, ajuda, relato de problemas, Sobre, Novidades e Licenças;
- toda tela do app aberta nos temas claro e escuro (a lista sai da pasta `app/`: tela nova entra sozinha).

Todo teste falha se o app fizer uma requisição para fora, tiver um erro de JavaScript ou registrar erro no console. Os dados de exemplo vêm de `e2e/web/demo-backup.json` (fictícios), restaurado pela própria tela de Backup.

Para rodar contra o servidor de desenvolvimento em vez do build: `E2E_URL=http://localhost:8081 npm run test:e2e` (com `npm run web` aberto). Numa falha, o Playwright guarda print e rastro em `e2e/web/test-results/` (`npx playwright show-trace <arquivo>`).

O que o navegador não alcança fica para o teste no aparelho: notificações, digital/rosto, a folha de compartilhamento nativa e o PDF nativo.

### Ponta a ponta no Android

Com o [Maestro](https://maestro.dev), sobre o APK instalado num emulador ou celular. Estes fluxos estão desatualizados desde a ADR 0011 (ex.: o botão "Usar este perfil" não existe mais) e precisam ser revistos antes de usar:

```
maestro test e2e/maestro/01-principal.yaml e2e/maestro/02-dieta-seguranca.yaml
```

APK de teste via EAS (não exige Mac nem Android SDK):

```
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

APK local (exige Android SDK): `npx expo prebuild --platform android --clean` e depois `cd android && ./gradlew assembleRelease` — o arquivo sai em `android/app/build/outputs/apk/release/OpenNutri-BR-<versão>.apk` (o nome vem do plugin `plugins/withApkFileName.js`, com a versão do `app.json`; builds de debug ganham o sufixo `-debug`). A pasta `android/` é gerada (e ignorada pelo git); rode o `prebuild --clean` de novo depois de mudar o ícone ou o `app.json`. O `prebuild` troca os scripts `android`/`ios` do `package.json` por `expo run:*`; descarte essa mudança. Sem as variáveis da chave de release, o APK sai assinado com a chave de debug (bom para testar, não para distribuir); veja [RELEASE.md](RELEASE.md#chave-de-assinatura-do-android-uma-vez). Os APKs publicados são gerados pelo GitHub Actions a cada tag.

Tamanho do APK (cerca de 31 MB): o `app.json` liga, pelo `expo-build-properties`, o R8 (código Java/Kotlin encolhido), a remoção de recursos não usados, a compressão das bibliotecas nativas e só as arquiteturas ARM (`armeabi-v7a`, `arm64-v8a`), que são as dos celulares. Emuladores x86_64 com Android 11 ou mais rodam o APK ARM por tradução; para um emulador sem essa tradução, compile com `./gradlew assembleRelease -PreactNativeArchitectures=x86_64`. Na Play Store, use o AAB (`eas build --profile production`): a loja entrega a cada aparelho só a parte dele.

No Windows, se o build parar em `ninja: error: manifest 'build.ninja' still dirty after 100 tries`, é o limite de 260 caracteres de caminho do ninja que acompanha o CMake 3.22 (acontece com o projeto numa pasta de caminho longo). Instale o CMake 3.31 pelo SDK Manager e acrescente `cmake.dir=<Android SDK>/cmake/3.31.6` ao `android/local.properties`, ou clone o projeto num caminho mais curto. Depois apague as pastas `.cxx` antigas (`node_modules/*/android/.cxx` e `android/app/.cxx`).

Build iOS via EAS exige conta Apple Developer (não exige Mac local).

### Arquivos gerados

Alguns JSON do app são gerados a partir de uma fonte única. Um teste falha se algum estiver desatualizado:

| Fonte | Comando (em `mobile/`) | Gera |
|---|---|---|
| `CHANGELOG.md` | `node scripts/build-changelog.mjs` | `src/data/changelog.json` (tela Novidades) |
| `docs/guia/*.md` | `node scripts/build-help.mjs` | `src/data/help.json` (Central de ajuda) |
| `package-lock.json` | `node scripts/build-licenses.mjs` | `src/data/licenses.json` (Licenças de código aberto; falha com licença incompatível com a GPL-3.0) |
| `backend/` | `php artisan catalog:export` | `src/data/catalog.json` e `docs/METODOS.md` |

A versão do app fica só no `app.json`; para subir, veja [RELEASE.md](RELEASE.md).

### Prints do README

Com o app rodando no navegador (`npm run web`), em outro terminal:

```
npm run prints
```

O roteiro (`e2e/web/prints.mjs`) restaura um backup com dados **fictícios** (`e2e/web/demo-backup.json`) pela tela de Backup, captura as telas principais nos temas claro e escuro em `docs/screenshots/` e falha se o app fizer qualquer requisição externa ou registrar erro no console. Usa o Edge (Windows) ou o Chrome instalado, sem baixar navegador (`PRINTS_BROWSER=chrome` para escolher).

### Tabelas embarcadas

Ícone do app (todos os formatos, a partir das cores definidas no script): `node scripts/build-icons.mjs`. Depois de mudar o ícone, rode `npx expo prebuild --platform android --clean` antes do build Android.

Tabelas embarcadas: `node scripts/build-who-tables.mjs` (curvas da OMS) e `node scripts/build-taco.mjs <planilha>` (TACO — ver [docs/data/taco-import.md](data/taco-import.md)).

## Backend

Requer PHP 8.3+ e Composer. Não é necessário para usar o app.

```
cd backend
composer install
cp .env.example .env          # já vem configurado para SQLite
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed    # popula o catálogo de calculadoras
php artisan test              # 299 testes: vetores das calculadoras, auditoria, curvas OMS, API, catálogo, LGPD
```

Ao adicionar ou alterar uma calculadora ou uma auditoria, regenere o catálogo do app e o `docs/METODOS.md` (um teste falha se algum estiver desatualizado):

```
php artisan catalog:export
```

Base TACO no banco do backend (opcional): `php artisan foods:import-taco caminho/para/taco-normalizado.csv`, ou `php artisan db:seed --class=DemoFoodSeeder` para alguns alimentos de demonstração.
