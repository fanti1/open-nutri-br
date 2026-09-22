<?php

namespace Database\Seeders;

use App\Domain\Calculators\Catalog\CalculatorCatalog;
use App\Models\Calculator;
use Illuminate\Database\Seeder;

/** Persiste o catálogo de calculadoras (ver CalculatorCatalog) na tabela `calculators`. */
class CalculatorCatalogSeeder extends Seeder
{
    public function run(CalculatorCatalog $catalog): void
    {
        foreach ($catalog->entries() as $entry) {
            Calculator::updateOrCreate(
                ['slug' => $entry['slug']],
                [...$entry, 'active' => true],
            );
        }
    }
}
