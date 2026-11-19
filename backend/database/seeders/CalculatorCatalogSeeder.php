<?php

namespace Database\Seeders;

use App\Domain\Calculators\Catalog\CalculatorCatalog;
use App\Models\Calculator;
use Illuminate\Database\Seeder;

/**
 * Persiste o catálogo de calculadoras (ver CalculatorCatalog) na tabela
 * `calculators`. A versão e a auditoria científica ficam fora do banco: vêm
 * sempre do código e de shared/auditoria.
 */
class CalculatorCatalogSeeder extends Seeder
{
    public function run(CalculatorCatalog $catalog): void
    {
        foreach ($catalog->entries() as $entry) {
            unset($entry['version'], $entry['audit']);

            Calculator::updateOrCreate(
                ['slug' => $entry['slug']],
                [...$entry, 'active' => true],
            );
        }
    }
}
