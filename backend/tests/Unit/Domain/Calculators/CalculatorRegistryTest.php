<?php

namespace Tests\Unit\Domain\Calculators;

use App\Domain\Calculators\Ambulatorio\Antropometria\Imc\ImcCalculator;
use App\Domain\Calculators\CalculatorNotFoundException;
use App\Domain\Calculators\CalculatorRegistry;
use Tests\TestCase;

class CalculatorRegistryTest extends TestCase
{
    public function test_resolves_a_registered_calculator_by_slug(): void
    {
        $registry = new CalculatorRegistry($this->app, ['imc' => ImcCalculator::class]);

        $this->assertInstanceOf(ImcCalculator::class, $registry->get('imc'));
    }

    public function test_returns_the_same_instance_on_repeated_lookups(): void
    {
        $registry = new CalculatorRegistry($this->app, ['imc' => ImcCalculator::class]);

        $this->assertSame($registry->get('imc'), $registry->get('imc'));
    }

    public function test_throws_for_an_unknown_slug(): void
    {
        $registry = new CalculatorRegistry($this->app, ['imc' => ImcCalculator::class]);

        $this->expectException(CalculatorNotFoundException::class);

        $registry->get('does-not-exist');
    }

    public function test_has_reports_whether_a_slug_is_registered(): void
    {
        $registry = new CalculatorRegistry($this->app, ['imc' => ImcCalculator::class]);

        $this->assertTrue($registry->has('imc'));
        $this->assertFalse($registry->has('does-not-exist'));
    }

    public function test_the_real_config_map_resolves_every_calculator(): void
    {
        $registry = $this->app->make(CalculatorRegistry::class);

        foreach ($registry->slugs() as $slug) {
            $this->assertSame($slug, $registry->get($slug)->slug());
        }
    }
}
