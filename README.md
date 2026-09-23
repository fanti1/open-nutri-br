# OpenNutri BR

App para nutricionistas brasileiros: calculadoras clínicas com método científico e referência, fichas de pacientes, agenda com lembretes e checklist de tarefas. App nativo em React Native/Expo que funciona inteiro offline; um backend Laravel serve de implementação de referência das fórmulas.

- **54 calculadoras**: Consultório (antropometria — incluindo relação cintura-estatura, índice de conicidade e dobras cutâneas de Jackson-Pollock e Durnin-Womersley — e metabolismo, incluindo Cunningham), Hospitalar/Terapia Intensiva (triagem, diagnóstico, suporte nutricional e gasto energético em ventilação mecânica e queimados — Penn State, Swinamer, Toronto), Pediatria (curvas de crescimento OMS com classificação SISVAN, Gomez, Waterlow, Schofield, necessidade energética FAO) e Hematologia/Bioquímica (anemia e ferritina OMS, diagnóstico glicêmico SBD, HOMA-IR, perfil lipídico, CKD-EPI 2021, Cockcroft-Gault). Cada uma declara para quais fases da vida (criança/adulto/idoso) foi validada.
- **100% offline**: todas as calculadoras (inclusive as curvas da OMS) e a tabela TACO completa rodam no celular, sem internet e sem servidor.
- **Tudo aberto a todos**, sem conta.
- **Dados no aparelho** (SQLite), com backup opcional no Google Drive (ou e-mail, WhatsApp…).

Decisões e lacunas de cada fase em `docs/adr/`:
[0001 Hospitalar/UTI](docs/adr/0001-fase-2-hospitalar-uti.md) ·
[0002 Pediatria](docs/adr/0002-fase-3-pediatria.md) ·
[0003 Dados locais e acesso aberto](docs/adr/0003-dados-locais-e-acesso-aberto.md) ·
[0004 Hematologia e Bioquímica](docs/adr/0004-fase-4-hematologia-bioquimica.md) ·
[0005 Extensões de Consultório](docs/adr/0005-fase-6-extensoes-consultorio.md) ·
[0006 App 100% offline](docs/adr/0006-app-100-offline.md).

## Estrutura

```
mobile/     App Expo/React Native (Android/iOS/web) — o produto, 100% offline
backend/    Laravel: implementação de referência das fórmulas e geração do catálogo (o app não depende dele)
shared/     Vetores de teste usados tanto pelo PHPUnit quanto pelo Jest
docs/       Decisões de arquitetura e documentação de dados (importação TACO)
```

## Arquitetura do app

```
mobile/
├── app/                   Telas (expo-router): abas Início, Calculadoras, Pacientes, Agenda, Mais
└── src/
    ├── data/              Banco local (migrações, repositórios, serviços) e tabelas oficiais embarcadas: who/ (OMS) e taco.json
    ├── domain/            Engine de cálculo (espelho do backend), curvas OMS, TACO, perfil do cálculo, formulários
    ├── features/          Componentes por funcionalidade (pacientes, calculadoras, agenda, tarefas, arquivos)
    └── ui/                Design system (tema claro/escuro, campos, cartões, abas, calendário, gráfico)
```

- **Local-first**: pacientes, atendimentos, cálculos salvos, anexos, agenda e tarefas ficam no SQLite do aparelho. Cada escrita notifica as telas inscritas (`useLiveQuery`), então a interface atualiza em tempo real.
- **Cálculo instantâneo e offline**: todas as calculadoras rodam no aparelho, em tempo real. As curvas da OMS usam as tabelas oficiais embarcadas no app.
- **Perfil do cálculo**: cada calculadora pergunta uma vez "para quem é" (faixa etária + sexo) e guarda a escolha; com paciente, o perfil vem da ficha.
- **Auto-preenchimento**: ao calcular para um paciente, idade, sexo e as últimas medidas da ficha preenchem o formulário.
- **Lembretes**: notificações locais do aparelho, sem servidor de push.
- **Backup**: um arquivo JSON com tudo, salvo no Google Drive pela tela de compartilhar do Android; restaurar reagenda os lembretes.

## Backend (Laravel) — referência das fórmulas

Não é necessário para usar o app. Serve para validar as fórmulas (os mesmos vetores de teste rodam no PHPUnit e no Jest) e gerar o catálogo embarcado.

```
cd backend
composer install
cp .env.example .env   # já vem configurado para SQLite
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed   # popula o catálogo de calculadoras
```

Testes (241: as 54 calculadoras com vetores científicos conhecidos, curvas OMS com gabarito da própria OMS, acesso público, catálogo, alimentos, LGPD):

```
php artisan test
```

Ao adicionar ou alterar uma calculadora, regenere o catálogo embarcado no app (um teste falha se ele estiver desatualizado):

```
php artisan catalog:export
```

Importar a base oficial TACO (ver `docs/data/taco-import.md` para o formato esperado):

```
php artisan foods:import-taco caminho/para/taco-normalizado.csv
```

Para popular alguns alimentos de demonstração antes disso:

```
php artisan db:seed --class=DemoFoodSeeder
```

## Mobile (Expo/React Native)

```
cd mobile
npm install
npm run android         # ou npm run ios (exige Mac) / npm run web
```

Testes (247: as 54 calculadoras contra os mesmos vetores do PHPUnit em `shared/calculators-spec/`, curvas OMS e TACO embarcadas, camada de dados sobre SQLite real, perfil do cálculo, formulários e auto-preenchimento):

```
npm test
```

Build de QA para Android via EAS (não exige Mac) — gera um APK para instalar direto no celular:

```
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

Nenhuma configuração de servidor é necessária: o APK funciona inteiro offline.

APK local, sem conta no EAS (exige Android SDK): `npx expo prebuild --platform android` e depois `cd android && ./gradlew assembleRelease`. O arquivo sai em `android/app/build/outputs/apk/release/app-release.apk`.

Tabelas embarcadas: `node scripts/build-who-tables.mjs` (curvas OMS) e `node scripts/build-taco.mjs <planilha>` (TACO, ver `docs/data/taco-import.md`).

Build iOS via EAS exige conta Apple Developer (US$99/ano) — sem atalho, mas também não exige Mac local.

## Decisões-chave

- **Faixa etária por calculadora**: cada calculadora declara para quais públicos (criança/adulto/idoso) sua fórmula foi validada; a ficha do paciente mostra só as adequadas à idade dele.
- **Fonte única das fórmulas**: backend e app implementam a mesma engine e são testados contra os mesmos vetores em `shared/calculators-spec/`. O catálogo do app é gerado a partir do backend.
- **Nomenclatura própria**: nomes de tela/produto (abas, seções) são próprios do OpenNutri BR, não copiados de nenhum concorrente. Nomes de métodos científicos (IMC, Harris-Benedict, GLIM etc.) são os nomes universais da literatura.
