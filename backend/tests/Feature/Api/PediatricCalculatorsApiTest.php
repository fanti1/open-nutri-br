<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\CalculatorCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PediatricCalculatorsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(CalculatorCatalogSeeder::class);
        Sanctum::actingAs(User::factory()->create());
    }

    public function test_computes_the_official_who_length_for_age_example_through_the_api(): void
    {
        $this->postJson('/api/v1/calculators/oms-comprimento-idade-0-5/calculate', [
            'age_months' => 987 / 30.4375,
            'sex' => 'male',
            'length_cm' => 72.86,
            'measurement_position' => 'deitado',
        ])
            ->assertOk()
            ->assertJsonPath('values.z_score', -6.09)
            ->assertJsonPath('classification', 'muito_baixa_estatura_para_idade');
    }

    public function test_a_length_outside_the_who_curve_returns_422_with_an_explanation(): void
    {
        // Peso-para-comprimento cobre 45–110 cm para menores de 2 anos.
        $this->postJson('/api/v1/calculators/oms-peso-comprimento-0-5/calculate', [
            'age_months' => 12,
            'sex' => 'male',
            'weight_kg' => 3,
            'length_cm' => 40,
            'measurement_position' => 'deitado',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'A curva peso-para-comprimento da OMS cobre de 45 a 110 cm.');
    }

    public function test_the_2007_reference_rejects_children_under_five_at_validation(): void
    {
        $this->postJson('/api/v1/calculators/oms-imc-idade-5-19/calculate', [
            'age_months' => 48,
            'sex' => 'female',
            'weight_kg' => 16,
            'height_cm' => 100,
        ])->assertUnprocessable()->assertJsonValidationErrors('age_months');
    }
}
