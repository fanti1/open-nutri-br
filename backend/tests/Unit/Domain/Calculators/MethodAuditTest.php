<?php

namespace Tests\Unit\Domain\Calculators;

use App\Domain\Calculators\CalculatorRegistry;
use App\Domain\Calculators\Catalog\MethodAudit;
use Tests\TestCase;

/**
 * Toda calculadora tem uma auditoria científica válida (shared/auditoria), e o
 * exemplo resolvido publicado bate com o que esta implementação calcula.
 */
class MethodAuditTest extends TestCase
{
    public function test_every_calculator_has_a_valid_audit_whose_example_matches_the_engine(): void
    {
        $registry = $this->app->make(CalculatorRegistry::class);

        foreach ($registry->all() as $calculator) {
            $audit = MethodAudit::for($calculator->slug());
            $outcome = $calculator->calculate($audit['example']['inputs']);

            foreach ($audit['example']['expected']['values'] as $key => $value) {
                $this->assertEqualsWithDelta($value, $outcome->values[$key], 1e-6, "Exemplo da auditoria de [{$calculator->slug()}] diverge em [{$key}].");
            }
            $this->assertSame($audit['example']['expected']['classification'], $outcome->classification);
            $this->assertNotEmpty($audit['example']['calculation']);
        }
    }

    public function test_every_audit_file_belongs_to_a_registered_calculator(): void
    {
        $registry = $this->app->make(CalculatorRegistry::class);

        foreach (glob(MethodAudit::directory().'/*.json') as $file) {
            $this->assertTrue($registry->has(basename($file, '.json')), "Auditoria sem calculadora: {$file}");
        }
    }

    public function test_methods_that_are_not_fully_verified_explain_why(): void
    {
        $registry = $this->app->make(CalculatorRegistry::class);

        foreach ($registry->slugs() as $slug) {
            $audit = MethodAudit::for($slug);
            if (in_array($audit['status'], ['pendente', 'divergente', 'conferido_com_ressalvas'], true)) {
                $this->assertTrue($audit['notes'] !== [] || count($audit['sources']) > 0, "[{$slug}] precisa explicar o que falta conferir.");
            }
        }
    }
}
