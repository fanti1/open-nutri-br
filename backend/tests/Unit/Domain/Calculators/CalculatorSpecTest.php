<?php

namespace Tests\Unit\Domain\Calculators;

use App\Domain\Calculators\CalculatorRegistry;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\Finder\Finder;
use Tests\TestCase;

/**
 * Runs every calculator in config/calculators.php against the test vectors in
 * shared/calculators-spec/*.json — the same files the mobile Jest suite reads,
 * so the PHP and TypeScript implementations are proven to agree on every case.
 */
class CalculatorSpecTest extends TestCase
{
    /**
     * @return array<string, array{0: string, 1: array<string, mixed>, 2: array<string, mixed>}>
     */
    public static function specCases(): array
    {
        $specDir = dirname(__DIR__, 5).'/shared/calculators-spec';
        $cases = [];

        foreach (Finder::create()->files()->name('*.json')->in($specDir) as $file) {
            $spec = json_decode($file->getContents(), true, flags: JSON_THROW_ON_ERROR);

            foreach ($spec['cases'] as $index => $case) {
                $cases["{$spec['slug']}#{$index}"] = [$spec['slug'], $case['inputs'], $case['expected']];
            }
        }

        return $cases;
    }

    /**
     * @param  array<string, mixed>  $inputs
     * @param  array{values: array<string, float>, classification: ?string}  $expected
     */
    #[DataProvider('specCases')]
    public function test_calculator_matches_spec(string $slug, array $inputs, array $expected): void
    {
        $registry = $this->app->make(CalculatorRegistry::class);
        $calculator = $registry->get($slug);

        $outcome = $calculator->calculate($inputs);

        foreach ($expected['values'] as $key => $value) {
            $this->assertEqualsWithDelta($value, $outcome->values[$key], 0.01, "Mismatch on output [{$key}] for calculator [{$slug}].");
        }

        $this->assertSame($expected['classification'], $outcome->classification, "Mismatch on classification for calculator [{$slug}].");
    }

    public function test_every_calculator_declares_a_reference(): void
    {
        $registry = $this->app->make(CalculatorRegistry::class);

        foreach ($registry->all() as $calculator) {
            $reference = $calculator->reference();

            $this->assertNotEmpty($reference->method, "Calculator [{$calculator->slug()}] has no reference method.");
            $this->assertNotEmpty($reference->citation, "Calculator [{$calculator->slug()}] has no reference citation.");
        }
    }

    public function test_every_calculator_declares_its_validated_life_stages(): void
    {
        $registry = $this->app->make(CalculatorRegistry::class);

        foreach ($registry->all() as $calculator) {
            $this->assertNotEmpty($calculator->lifeStages(), "Calculator [{$calculator->slug()}] does not declare which life stages (child/adult/elderly) its formula is validated for.");
        }
    }

    public function test_every_spec_file_matches_a_registered_calculator(): void
    {
        $registry = $this->app->make(CalculatorRegistry::class);

        foreach (array_keys(self::specCases()) as $key) {
            [$slug] = explode('#', $key);
            $this->assertTrue($registry->has($slug), "Spec file references unknown calculator slug [{$slug}].");
        }
    }
}
