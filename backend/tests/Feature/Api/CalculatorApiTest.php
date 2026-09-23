<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CalculatorApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\CalculatorCatalogSeeder::class);
        Sanctum::actingAs(User::factory()->create());
    }

    public function test_lists_the_seeded_calculator_catalog(): void
    {
        $response = $this->getJson('/api/v1/calculators');

        $response->assertOk();
        $this->assertGreaterThanOrEqual(12, count($response->json()));
    }

    public function test_filters_by_module_and_category(): void
    {
        $response = $this->getJson('/api/v1/calculators?module=ambulatorio&category=metabolismo');

        $response->assertOk();

        foreach ($response->json() as $calculator) {
            $this->assertSame('ambulatorio', $calculator['module']);
            $this->assertSame('metabolismo', $calculator['category']);
        }
    }

    public function test_filters_by_life_stage(): void
    {
        $calculators = collect($this->getJson('/api/v1/calculators?life_stage=crianca')->assertOk()->json());
        $slugs = $calculators->pluck('slug');

        $this->assertTrue($calculators->every(fn (array $c) => in_array('crianca', $c['life_stages'], true)));
        $this->assertTrue($slugs->contains('oms-peso-idade-0-5'));
        $this->assertTrue($slugs->contains('holliday-segar'));
        // Adult-only equations must never be offered for a child.
        $this->assertFalse($slugs->contains('imc'));
        $this->assertFalse($slugs->contains('mifflin-st-jeor'));
    }

    public function test_shows_a_single_calculator_with_its_reference(): void
    {
        $response = $this->getJson('/api/v1/calculators/imc');

        $response->assertOk()
            ->assertJsonPath('slug', 'imc')
            ->assertJsonPath('life_stages', ['adulto']);
    }

    public function test_elderly_bmi_uses_the_sisvan_cutoffs(): void
    {
        $this->getJson('/api/v1/calculators/imc-idoso')
            ->assertOk()
            ->assertJsonPath('life_stages', ['idoso']);

        // 25 kg/m² seria sobrepeso no adulto (OMS), mas é peso adequado no idoso (> 22 e < 27).
        $this->postJson('/api/v1/calculators/imc-idoso/calculate', ['weight_kg' => 64, 'height_m' => 1.6])
            ->assertOk()
            ->assertJsonPath('values.value', 25)
            ->assertJsonPath('classification', 'eutrofia');
    }

    public function test_returns_404_for_an_unknown_calculator(): void
    {
        $this->getJson('/api/v1/calculators/does-not-exist')->assertNotFound();
    }

    public function test_calculates_standalone_without_persisting_anything(): void
    {
        $response = $this->postJson('/api/v1/calculators/imc/calculate', [
            'weight_kg' => 70,
            'height_m' => 1.75,
        ]);

        $response->assertOk()
            ->assertJsonPath('values.value', 22.86)
            ->assertJsonPath('classification', 'eutrofia');

        $this->assertDatabaseCount('calculation_results', 0);
    }

    public function test_calculate_validates_inputs_against_the_calculators_own_schema(): void
    {
        $response = $this->postJson('/api/v1/calculators/imc/calculate', [
            'weight_kg' => 70,
            // height_m missing
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('height_m');
    }
}
