# OpenNutri BR

App de calculadoras clínicas para nutricionistas brasileiros — backend em Laravel, app mobile nativo em React Native/Expo. Cobre Ambulatório (antropometria + metabolismo), Hospitalar/UTI (triagem/diagnóstico + suporte nutricional) e Pediatria (curvas de crescimento OMS com classificação SISVAN, Gomez, Waterlow, Schofield, necessidade energética FAO) — 38 calculadoras no total — com arquitetura pronta para hematologia/bioquímica e home care. Decisões e lacunas de cada fase em `docs/adr/`.

Veja o plano completo de arquitetura e o catálogo científico de todas as calculadoras (implementadas e futuras, cada uma com fórmula e referência bibliográfica) em `docs/`.

## Estrutura

```
backend/    API Laravel (auth, calculadoras, pacientes, sessões, alimentos, LGPD)
mobile/     App Expo/React Native (iOS/Android, UI nativa)
shared/     Vetores de teste usados tanto pelo PHPUnit quanto pelo Jest
docs/       Documentação de dados (importação TACO) e decisões de arquitetura
```

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

Rodar os testes (162 testes cobrindo as 38 calculadoras com vetores científicos conhecidos, autenticação, pacientes/sessões/evolução, alimentos, LGPD):

```
php artisan test
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
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL para apontar pro backend
npm run android         # ou npm run ios (exige Mac) / npm run web
```

Rodar os testes (94 testes: a mesma engine de cálculo das calculadoras de fórmula pura, validada contra os mesmos vetores usados no PHPUnit em `shared/calculators-spec/`):

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

- **Faixa etária por calculadora**: cada calculadora declara cientificamente para quais públicos (criança/adulto/idoso) sua fórmula foi validada — a Home e a tela de paciente filtram por isso automaticamente (`GET /patients/{id}/calculators`).
- **Cálculo híbrido**: o app calcula localmente para UX instantânea, mas ao salvar num atendimento o servidor recalcula e persiste o resultado oficial — nunca confia no cliente para o dado clínico salvo.
- **Nomenclatura própria**: nomes de tela/produto (abas, seções) são próprios do OpenNutri BR, não copiados de nenhum concorrente. Nomes de métodos científicos (IMC, Harris-Benedict, etc.) são os nomes universais da literatura.
