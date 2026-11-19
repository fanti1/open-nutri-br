<?php

namespace App\Console\Commands;

use App\Domain\Calculators\Catalog\CalculatorCatalog;
use App\Domain\Calculators\Catalog\MethodsDocument;
use Illuminate\Console\Command;

/**
 * Gera o arquivo de catálogo embarcado no app mobile (para que a lista de
 * calculadoras e a auditoria de cada método funcionem sem internet) e o
 * documento público docs/METODOS.md. Rodar sempre que uma calculadora ou uma
 * auditoria (shared/auditoria) mudar — o CatalogSnapshotTest falha se algum
 * dos dois estiver desatualizado.
 */
class ExportCalculatorCatalog extends Command
{
    protected $signature = 'catalog:export {--path= : Destino do arquivo (padrão: ../mobile/src/data/catalog.json)}';

    protected $description = 'Exporta o catálogo de calculadoras para o app mobile';

    public function handle(CalculatorCatalog $catalog): int
    {
        $path = $this->option('path') ?: self::defaultPath();

        $entries = $catalog->entries();

        file_put_contents($path, self::encode($entries));
        file_put_contents(self::documentPath(), MethodsDocument::render($entries));

        $this->info("Catálogo exportado para {$path}");
        $this->info('Auditoria publicada em '.self::documentPath());

        return self::SUCCESS;
    }

    public static function defaultPath(): string
    {
        return base_path('../mobile/src/data/catalog.json');
    }

    public static function documentPath(): string
    {
        return base_path('../docs/METODOS.md');
    }

    /** @param  list<array<string, mixed>>  $entries */
    public static function encode(array $entries): string
    {
        return json_encode($entries, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n";
    }
}
