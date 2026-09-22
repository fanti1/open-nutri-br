<?php

namespace App\Console\Commands;

use App\Domain\Calculators\Catalog\CalculatorCatalog;
use Illuminate\Console\Command;

/**
 * Gera o arquivo de catálogo embarcado no app mobile, para que a lista de
 * calculadoras funcione sem internet. Rodar sempre que uma calculadora for
 * criada/alterada — o teste CatalogSnapshotTest falha se o arquivo estiver desatualizado.
 */
class ExportCalculatorCatalog extends Command
{
    protected $signature = 'catalog:export {--path= : Destino do arquivo (padrão: ../mobile/src/data/catalog.json)}';

    protected $description = 'Exporta o catálogo de calculadoras para o app mobile';

    public function handle(CalculatorCatalog $catalog): int
    {
        $path = $this->option('path') ?: self::defaultPath();

        file_put_contents($path, self::encode($catalog->entries()));

        $this->info("Catálogo exportado para {$path}");

        return self::SUCCESS;
    }

    public static function defaultPath(): string
    {
        return base_path('../mobile/src/data/catalog.json');
    }

    /** @param  list<array<string, mixed>>  $entries */
    public static function encode(array $entries): string
    {
        return json_encode($entries, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n";
    }
}
