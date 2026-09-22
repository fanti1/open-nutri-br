<?php

namespace Tests\Feature;

use App\Models\Food;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImportTacoFoodsTest extends TestCase
{
    use RefreshDatabase;

    public function test_imports_a_normalized_csv_into_the_foods_table(): void
    {
        $path = base_path('tests/Fixtures/taco-sample.csv');

        $this->artisan('foods:import-taco', ['path' => $path])->assertExitCode(0);

        $this->assertDatabaseCount('foods', 2);

        $rice = Food::where('source_code', '101')->first();
        $this->assertNotNull($rice);
        $this->assertSame('taco', $rice->source);
        $this->assertEqualsWithDelta(128.0, (float) $rice->energy_kcal, 0.01);
        $this->assertNull($rice->saturated_fat_g, 'NA should be normalized to null.');
        $this->assertSame('arroz, tipo 1, cozido', $rice->name_search);
    }

    public function test_re_running_the_import_upserts_instead_of_duplicating(): void
    {
        $path = base_path('tests/Fixtures/taco-sample.csv');

        $this->artisan('foods:import-taco', ['path' => $path]);
        $this->artisan('foods:import-taco', ['path' => $path]);

        $this->assertDatabaseCount('foods', 2);
    }

    public function test_fails_gracefully_for_a_missing_file(): void
    {
        $this->artisan('foods:import-taco', ['path' => base_path('tests/Fixtures/does-not-exist.csv')])
            ->assertExitCode(1);
    }
}
