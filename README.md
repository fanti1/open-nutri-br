# OpenNutri BR

App para nutricionistas brasileiros: calculadoras clínicas com método científico e referência, fichas de pacientes, agenda com lembretes e checklist de tarefas. Backend em Laravel, app mobile nativo em React Native/Expo.

- **38 calculadoras**: Consultório (antropometria + metabolismo), Hospitalar/Terapia Intensiva (triagem, diagnóstico e suporte nutricional) e Pediatria (curvas de crescimento OMS com classificação SISVAN, Gomez, Waterlow, Schofield, necessidade energética FAO). Cada uma declara para quais fases da vida (criança/adulto/idoso) foi validada.
- **Tudo aberto a todos**, sem conta obrigatória.
- **Dados no aparelho** (SQLite) com backup em arquivo para Drive/iCloud/e-mail.

Decisões e lacunas de cada fase em `docs/adr/`:
[0001 Hospitalar/UTI](docs/adr/0001-fase-2-hospitalar-uti.md) ·
[0002 Pediatria](docs/adr/0002-fase-3-pediatria.md) ·
[0003 Dados locais e acesso aberto](docs/adr/0003-dados-locais-e-acesso-aberto.md).

## Estrutura

```
backend/    API Laravel: engine de cálculo, catálogo, curvas OMS, alimentos (TACO)
mobile/     App Expo/React Native (Android/iOS/web)
shared/     Vetores de teste usados tanto pelo PHPUnit quanto pelo Jest
docs/       Decisões de arquitetura e documentação de dados (importação TACO)
```

## Arquitetura do app

```
mobile/
├── app/                   Telas (expo-router): abas Início, Calculadoras, Pacientes, Agenda, Mais
└── src/
    ├── data/              Banco local: migrações, repositórios, serviços (agenda, tarefas, backup, lembretes)
    ├── domain/            Engine de cálculo (espelho do backend), catálogo, auto-preenchimento, formulários
    ├── features/          Componentes por funcionalidade (pacientes, calculadoras, agenda, tarefas, arquivos)
    ├── ui/                Design system (tema claro/escuro, campos, cartões, calendário, gráfico)
    └── api/               Cliente HTTP — só para cálculos que rodam no servidor (curvas OMS) e alimentos
```

- **Local-first**: pacientes, atendimentos, cálculos salvos, anexos, agenda e tarefas ficam no SQLite do aparelho. Cada escrita notifica as telas inscritas (`useLiveQuery`), então a interface atualiza em tempo real.
- **Cálculo instantâneo**: as calculadoras de fórmula pura rodam no aparelho, inclusive offline. As curvas OMS usam as tabelas oficiais no servidor, que recebe só as medidas.
- **Auto-preenchimento**: ao calcular para um paciente, idade, sexo e as últimas medidas da ficha preenchem o formulário.
- **Lembretes**: notificações locais do aparelho, sem servidor de push.
- **Backup**: um arquivo JSON com tudo; restaurar reagenda os lembretes.

## Backend (Laravel)

```
cd backend
composer install
cp .env.example .env   # já vem configurado para SQLite
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed   # popula o catálogo de calculadoras
php artisan serve --host=0.0.0.0   # necessário para o celular físico acessar via IP da LAN
```

Testes (167: as 38 calculadoras com vetores científicos conhecidos, curvas OMS com gabarito da própria OMS, acesso público, catálogo, alimentos, LGPD):

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
cp .env.example .env   # EXPO_PUBLIC_API_URL: backend usado pelas curvas OMS e pelos alimentos
npm run android         # ou npm run ios (exige Mac) / npm run web
```

Testes (127: a engine de cálculo contra os mesmos vetores do PHPUnit em `shared/calculators-spec/`, camada de dados sobre SQLite real, formulários e auto-preenchimento):

```
npm test
```

Build de QA para Android via EAS (não exige Mac):

```
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

Build iOS via EAS exige conta Apple Developer (US$99/ano) — sem atalho, mas também não exige Mac local.

## Decisões-chave

- **Faixa etária por calculadora**: cada calculadora declara para quais públicos (criança/adulto/idoso) sua fórmula foi validada; a ficha do paciente mostra só as adequadas à idade dele.
- **Fonte única das fórmulas**: backend e app implementam a mesma engine e são testados contra os mesmos vetores em `shared/calculators-spec/`. O catálogo do app é gerado a partir do backend.
- **Nomenclatura própria**: nomes de tela/produto (abas, seções) são próprios do OpenNutri BR, não copiados de nenhum concorrente. Nomes de métodos científicos (IMC, Harris-Benedict, GLIM etc.) são os nomes universais da literatura.
