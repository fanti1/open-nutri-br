<?php

namespace Tests\Feature;

use App\Console\Commands\ExportCalculatorCatalog;
use App\Domain\Calculators\Catalog\CalculatorCatalog;
use Tests\TestCase;

/**
 * O app mobile embarca o catálogo em mobile/src/data/catalog.json. Se uma
 * calculadora mudar no backend e o arquivo não for regenerado, o app
 * mostraria campos/referências desatualizados — este teste impede isso.
 */
class CatalogSnapshotTest extends TestCase
{
    public function test_the_mobile_catalog_snapshot_is_up_to_date(): void
    {
        $path = ExportCalculatorCatalog::defaultPath();
        $this->assertFileExists($path, 'Rode `php artisan catalog:export`.');

        $expected = ExportCalculatorCatalog::encode($this->app->make(CalculatorCatalog::class)->entries());

        $this->assertSame(
            str_replace("\r\n", "\n", $expected),
            str_replace("\r\n", "\n", file_get_contents($path)),
            'mobile/src/data/catalog.json está desatualizado — rode `php artisan catalog:export`.',
        );
    }

    public function test_every_calculator_has_presentation_metadata(): void
    {
        $entries = $this->app->make(CalculatorCatalog::class)->entries();

        $this->assertCount(38, $entries);
        foreach ($entries as $entry) {
            $this->assertNotEmpty($entry['name']);
            $this->assertNotEmpty($entry['life_stages']);
        }
    }
}
