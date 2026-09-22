<?php

namespace App\Console\Commands;

use App\Imports\TacoFoodsImport;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;

class ImportTacoFoods extends Command
{
    protected $signature = 'foods:import-taco {path : Path to the normalized TACO CSV/XLSX file}';

    protected $description = 'Imports (or upserts) the TACO food composition table into the foods table';

    public function handle(): int
    {
        $path = $this->argument('path');

        if (! is_readable($path)) {
            $this->error("File not readable: {$path}");

            return self::FAILURE;
        }

        Excel::import(new TacoFoodsImport, $path);

        $this->info('TACO import completed.');

        return self::SUCCESS;
    }
}
