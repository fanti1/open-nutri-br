<?php

namespace App\Domain\Calculators\Catalog;

use RuntimeException;

/**
 * Auditoria científica de cada calculadora (shared/auditoria/<slug>.json): o
 * que foi conferido, em qual fonte, com qual grau de acesso, ressalvas,
 * mudanças e um exemplo resolvido. É embarcada no app e publicada em
 * docs/METODOS.md, para que qualquer pessoa confira. O exemplo aponta um caso
 * de shared/calculators-spec, então os testes das duas engines o verificam.
 */
final class MethodAudit
{
    public const STATUSES = ['conferido', 'conferido_com_ressalvas', 'pendente', 'divergente'];

    public const EVIDENCE = ['texto_completo', 'documento_oficial', 'resumo', 'reproducao', 'nao_acessado'];

    public static function directory(): string
    {
        return base_path('../shared/auditoria');
    }

    /**
     * @return array<string, mixed>
     */
    public static function for(string $slug): array
    {
        $audit = self::read(self::directory()."/{$slug}.json");

        foreach (['status', 'verified_at', 'summary', 'formula', 'sources', 'notes', 'changes', 'example'] as $key) {
            if (! array_key_exists($key, $audit)) {
                throw new RuntimeException("Auditoria de [{$slug}] sem o campo [{$key}].");
            }
        }
        if (! in_array($audit['status'], self::STATUSES, true)) {
            throw new RuntimeException("Auditoria de [{$slug}] com status inválido [{$audit['status']}].");
        }
        foreach ($audit['sources'] as $source) {
            if (empty($source['citation']) || empty($source['checked']) || ! in_array($source['evidence'] ?? null, self::EVIDENCE, true)) {
                throw new RuntimeException("Auditoria de [{$slug}] com fonte incompleta.");
            }
        }

        $spec = self::read(base_path("../shared/calculators-spec/{$slug}.json"));
        $case = $spec['cases'][$audit['example']['spec_case']]
            ?? throw new RuntimeException("Exemplo da auditoria de [{$slug}] aponta um caso inexistente.");

        unset($audit['slug']);
        $audit['example'] = [
            'inputs' => $case['inputs'],
            'calculation' => $audit['example']['calculation'],
            'expected' => $case['expected'],
        ];

        return $audit;
    }

    /**
     * @return array<string, mixed>
     */
    private static function read(string $path): array
    {
        if (! is_file($path)) {
            throw new RuntimeException("Arquivo não encontrado: {$path}");
        }

        return json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    }
}
