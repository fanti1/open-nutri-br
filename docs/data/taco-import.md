# Tabela TACO no app

Fonte oficial: TACO — Tabela Brasileira de Composição de Alimentos, 4ª edição
revisada e ampliada (NEPA-UNICAMP, 2011), dados públicos. Planilha:
https://nepa.unicamp.br/publicacoes/tabela-taco-excel/ (`Taco-4a-Edicao.xlsx`).

## App (offline)

A tabela completa (597 alimentos, 15 grupos) vai embutida no app em
`mobile/src/data/taco.json`, gerada a partir da planilha oficial:

```
cd mobile
npm i --no-save xlsx
node scripts/build-taco.mjs caminho/para/Taco-4a-Edicao.xlsx
```

O script lê as abas "CMVCol taco3" (composição centesimal, minerais e vitaminas)
e "AGtaco3" (ácidos graxos), arredonda com a precisão da tabela publicada e
preserva a legenda oficial da planilha:

- `NA` — não aplicável
- `Tr` — traço (também quando o valor arredondado cai entre 0 e a menor casa exibida)
- `*` — análises sendo reavaliadas pela TACO
- célula vazia — análise não solicitada

Ver ADR 0006.

## Backend (referência, opcional)

O backend Laravel mantém a importação para o banco dele (não usada pelo app):
normalize a planilha para um CSV plano com as colunas

```
source_code,name,food_group,energy_kcal,protein_g,carbohydrate_g,lipid_g,fiber_g,saturated_fat_g,monounsaturated_fat_g,polyunsaturated_fat_g,cholesterol_mg,calcium_mg,iron_mg,sodium_mg,potassium_mg,vitamin_a_mcg,vitamin_c_mg,household_portion
```

e rode `php artisan foods:import-taco storage/app/imports/taco-normalizado.csv`
(idempotente pelos campos `source` + `source_code`). Os ~15 alimentos de
`database/seeders/DemoFoodSeeder.php` são só para desenvolvimento.
