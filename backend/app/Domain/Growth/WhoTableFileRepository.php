<?php

namespace App\Domain\Growth;

use App\Domain\Growth\Contracts\GrowthReferenceRepository;
use RuntimeException;

/**
 * Lê as tabelas oficiais da OMS de database/data/who/*.txt (tab-separated,
 * colunas sex, eixo, l, m, s). Cada tabela é carregada uma única vez por processo.
 */
final class WhoTableFileRepository implements GrowthReferenceRepository
{
    /** @var array<string, array<int, array<int, LmsParameters>>> */
    private array $tables = [];

    public function __construct(
        private readonly string $directory,
    ) {}

    public function exact(string $table, int $sex, int $key): ?LmsParameters
    {
        return $this->load($table)[$sex][$key] ?? null;
    }

    /**
     * Mesma interpolação dos pacotes da OMS: ponto inferior = trunc(x), superior
     * = trunc(x + 1), fração = x − inferior (na escala da chave).
     */
    public function interpolated(string $table, int $sex, float $x, int $keyScale): ?LmsParameters
    {
        $rows = $this->load($table)[$sex] ?? [];
        $scaled = $x * $keyScale;
        $lowerKey = (int) $scaled;
        $fraction = $scaled - $lowerKey;

        $lower = $rows[$lowerKey] ?? null;

        if ($lower === null) {
            return null;
        }

        if ($fraction <= 0) {
            return $lower;
        }

        $upper = $rows[$lowerKey + 1] ?? null;

        return $upper === null ? null : $lower->interpolateTowards($upper, $fraction);
    }

    /**
     * @return array<int, array<int, LmsParameters>>
     */
    private function load(string $table): array
    {
        if (isset($this->tables[$table])) {
            return $this->tables[$table];
        }

        $path = "{$this->directory}/{$table}.txt";

        if (! is_readable($path)) {
            throw new RuntimeException("Tabela de referência de crescimento não encontrada: {$path}");
        }

        // Tabelas de comprimento/estatura usam décimos de cm como eixo; o resto, inteiros (dias/meses).
        $axisScale = in_array($table, ['wflanthro', 'wfhanthro'], true) ? 10 : 1;
        $rows = [];

        foreach (array_slice(file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES), 1) as $line) {
            $columns = explode("\t", trim($line));
            [$sex, $axis, $l, $m, $s] = $columns;

            $rows[(int) $sex][(int) round((float) $axis * $axisScale)] = new LmsParameters((float) $l, (float) $m, (float) $s);
        }

        return $this->tables[$table] = $rows;
    }
}
