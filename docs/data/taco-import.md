# Importação da base TACO

Fonte oficial: TACO — Tabela Brasileira de Composição de Alimentos, 4ª edição
(NEPA-UNICAMP, 2011), dados públicos.

A planilha oficial publica os alimentos agrupados por categoria com cabeçalhos
irregulares (mescla de células, notas de rodapé). Antes de importar, normalize
para um CSV/XLSX plano com estas colunas (nomes exatos, uma linha por alimento):

```
source_code,name,food_group,energy_kcal,protein_g,carbohydrate_g,lipid_g,fiber_g,saturated_fat_g,monounsaturated_fat_g,polyunsaturated_fat_g,cholesterol_mg,calcium_mg,iron_mg,sodium_mg,potassium_mg,vitamin_a_mcg,vitamin_c_mg,household_portion
```

Notação da própria TACO a preservar (o importador já trata isso, convertendo
para `null`):
- `NA` — não analisado
- `Tr` — traço (quantidade insignificante)

Rodar a importação (idempotente — reimportar atualiza pelos campos
`source` + `source_code`, nunca duplica):

```
php artisan foods:import-taco storage/app/imports/taco-normalizado.csv
```

Os ~15 alimentos em `database/seeders/DemoFoodSeeder.php` são apenas para
desenvolvimento/demonstração do módulo de Alimentos antes da importação oficial
— não usar seus valores para decisões clínicas reais.
