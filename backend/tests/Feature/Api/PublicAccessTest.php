<?php

namespace Tests\Feature\Api;

use App\Models\Food;
use Database\Seeders\CalculatorCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Calculadoras e alimentos são abertos a todos, sem conta. */
class PublicAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_calculators_are_available_without_an_account(): void
    {
        $this->seed(CalculatorCatalogSeeder::class);

        $this->getJson('/api/v1/calculators')->assertOk();
        $this->postJson('/api/v1/calculators/imc/calculate', ['weight_kg' => 70, 'height_m' => 1.75])
            ->assertOk()
            ->assertJsonPath('classification', 'eutrofia');
    }

    public function test_foods_are_available_without_an_account(): void
    {
        $food = Food::factory()->create();

        $this->getJson('/api/v1/foods')->assertOk();
        $this->getJson("/api/v1/foods/{$food->id}")->assertOk();
    }

    public function test_patient_data_endpoints_still_require_an_account(): void
    {
        $this->getJson('/api/v1/patients')->assertUnauthorized();
    }
}
