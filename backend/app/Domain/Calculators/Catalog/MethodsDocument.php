<?php

namespace App\Domain\Calculators\Catalog;

/**
 * Gera docs/METODOS.md a partir do catálogo e das auditorias — o registro
 * público de como cada método foi conferido. Escrito pelo catalog:export e
 * verificado pelo CatalogSnapshotTest, para nunca divergir do que o app mostra.
 */
final class MethodsDocument
{
    public const STATUS_LABELS = [
        'conferido' => 'Conferido na fonte',
        'conferido_com_ressalvas' => 'Conferido, com ressalvas',
        'pendente' => 'Conferência pendente',
        'divergente' => 'Divergência encontrada',
    ];

    public const EVIDENCE_LABELS = [
        'texto_completo' => 'texto completo da fonte',
        'documento_oficial' => 'documento oficial',
        'resumo' => 'resumo da fonte (PubMed)',
        'reproducao' => 'reprodução em artigo aberto',
        'nao_acessado' => 'fonte não acessada',
    ];

    private const MODULE_LABELS = [
        'ambulatorio' => 'Consultório',
        'hospitalar' => 'Hospitalar e Terapia Intensiva',
        'pediatria' => 'Pediatria',
        'bioquimica' => 'Exames laboratoriais',
    ];

    private const STAGE_LABELS = ['crianca' => 'C', 'adulto' => 'A', 'idoso' => 'I'];

    /** @param  list<array<string, mixed>>  $entries */
    public static function render(array $entries): string
    {
        $counts = array_fill_keys(array_keys(self::STATUS_LABELS), 0);
        foreach ($entries as $entry) {
            $counts[$entry['audit']['status']]++;
        }

        $lines = [
            '# Métodos e auditoria científica',
            '',
            '> Arquivo gerado por `php artisan catalog:export` a partir de `shared/auditoria/*.json` — não edite à mão.',
            '',
            'Cada calculadora do OpenNutri BR tem aqui a fórmula e os pontos de corte que o app usa, as fontes em que foram conferidos (com o grau de acesso a cada uma), as ressalvas, as mudanças e um exemplo resolvido. O mesmo conteúdo aparece no app, em "Sobre o método e referência". O exemplo de cada método é um caso de `shared/calculators-spec/`, verificado a cada teste pelas duas implementações (PHP e TypeScript).',
            '',
            '## Como ler',
            '',
            '| Situação | Significado |',
            '|---|---|',
            '| '.self::STATUS_LABELS['conferido'].' | Todos os coeficientes e pontos de corte foram conferidos em fonte primária ou documento oficial. |',
            '| '.self::STATUS_LABELS['conferido_com_ressalvas'].' | Conferido, mas parte depende de resumo ou de reprodução em artigo aberto, ou a própria fonte tem ambiguidade (descrita nas ressalvas). |',
            '| '.self::STATUS_LABELS['pendente'].' | Algum parâmetro ainda não pôde ser conferido na fonte (texto fechado ou indisponível). Nada foi alterado de memória. |',
            '| '.self::STATUS_LABELS['divergente'].' | O método do app não corresponde à fonte citada ou à diretriz vigente. Aguarda decisão; o problema está descrito. |',
            '',
            'Grau de acesso a cada fonte: '.implode(' · ', array_values(self::EVIDENCE_LABELS)).'.',
            '',
            '**Encontrou algo diferente da fonte?** Abra uma issue com o modelo "Divergência científica", informando o método, a fonte (com página ou tabela) e o valor esperado.',
            '',
            '## Resumo',
            '',
            sprintf('%d métodos — %s.', count($entries), implode(' · ', array_map(
                fn (string $status) => self::STATUS_LABELS[$status].': '.$counts[$status],
                array_keys(self::STATUS_LABELS),
            ))),
            '',
            '| Método | Área | Público | Versão | Situação |',
            '|---|---|---|---|---|',
        ];

        foreach ($entries as $entry) {
            $lines[] = sprintf(
                '| [%s](#%s) | %s | %s | %s | %s |',
                $entry['name'],
                $entry['slug'],
                self::MODULE_LABELS[$entry['module']] ?? $entry['module'],
                implode(', ', array_map(fn ($s) => self::STAGE_LABELS[$s], $entry['life_stages'])),
                $entry['version'],
                self::STATUS_LABELS[$entry['audit']['status']],
            );
        }
        $lines[] = '';
        $lines[] = 'Público: C criança/adolescente · A adulto · I idoso.';

        foreach ($entries as $entry) {
            $lines = [...$lines, '', ...self::section($entry)];
        }

        return implode("\n", $lines)."\n";
    }

    /**
     * @param  array<string, mixed>  $entry
     * @return list<string>
     */
    private static function section(array $entry): array
    {
        $audit = $entry['audit'];
        $date = implode('/', array_reverse(explode('-', $audit['verified_at'])));

        $lines = [
            sprintf('<a id="%s"></a>', $entry['slug']),
            '',
            sprintf('## %s', $entry['name']),
            '',
            sprintf('`%s` · versão %s · **%s** (conferido em %s)', $entry['slug'], $entry['version'], self::STATUS_LABELS[$audit['status']], $date),
            '',
            $audit['summary'],
            '',
            '**Fórmula e pontos de corte:** '.$audit['formula'],
            '',
            '**Fontes:**',
            '',
        ];

        if ($audit['sources'] === []) {
            $lines[] = '- Nenhuma fonte clínica (conta aritmética ou fonte ainda não identificada — ver ressalvas).';
        }
        foreach ($audit['sources'] as $source) {
            $lines[] = sprintf(
                '- %s [link](%s) — *%s*. %s',
                $source['citation'],
                $source['url'],
                self::EVIDENCE_LABELS[$source['evidence']],
                $source['checked'],
            );
        }

        if ($audit['notes'] !== []) {
            $lines = [...$lines, '', '**Ressalvas:**', '', ...array_map(fn (string $note) => "- {$note}", $audit['notes'])];
        }
        if ($audit['changes'] !== []) {
            $lines = [...$lines, '', '**Mudanças:**', '', ...array_map(
                fn (array $change) => sprintf('- %s (%s): %s', implode('/', array_reverse(explode('-', $change['date']))), $change['version'], $change['text']),
                $audit['changes'],
            )];
        }

        $example = $audit['example'];
        $inputs = implode(', ', array_map(
            fn ($key, $value) => "{$key} = ".self::value($value),
            array_keys($example['inputs']),
            $example['inputs'],
        ));
        $values = implode(', ', array_map(
            fn ($key, $value) => "{$key} = ".self::value($value),
            array_keys($example['expected']['values']),
            $example['expected']['values'],
        ));

        return [
            ...$lines,
            '',
            '**Exemplo resolvido:**',
            '',
            "- Entradas: {$inputs}",
            "- Cálculo: {$example['calculation']}",
            '- Resultado: '.$values.($example['expected']['classification'] ? " · classificação `{$example['expected']['classification']}`" : ''),
        ];
    }

    private static function value(mixed $value): string
    {
        return match (true) {
            is_bool($value) => $value ? 'sim' : 'não',
            is_float($value), is_int($value) => str_replace('.', ',', (string) $value),
            default => (string) $value,
        };
    }
}
