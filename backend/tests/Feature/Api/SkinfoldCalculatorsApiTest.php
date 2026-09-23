<?php

namespace Tests\Feature\Api;

use Database\Seeders\CalculatorCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkinfoldCalculatorsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(CalculatorCatalogSeeder::class);
    }

    public function test_jackson_pollock_3_asks_women_for_triceps_and_suprailiac(): void
    {
        $this->postJson('/api/v1/calculators/jackson-pollock-3/calculate', [
            'sex' => 'female',
            'age_years' => 25,
            'skinfold_chest_mm' => 10,
            'skinfold_thigh_mm' => 25,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['skinfold_triceps_mm', 'skinfold_suprailiac_mm'])
            ->assertJsonMissingValidationErrors(['skinfold_chest_mm', 'skinfold_abdominal_mm']);
    }

    public function test_jackson_pollock_3_computes_men_from_chest_abdomen_and_thigh(): void
    {
        $this->postJson('/api/v1/calculators/jackson-pollock-3/calculate', [
            'sex' => 'male',
            'age_years' => 30,
            'skinfold_chest_mm' => 15,
            'skinfold_abdominal_mm' => 20,
            'skinfold_thigh_mm' => 18,
        ])
            ->assertOk()
            ->assertJsonPath('values.sum_skinfolds_mm', 53);
    }

    public function test_durnin_womersley_rejects_ages_outside_the_study_sample(): void
    {
        $this->postJson('/api/v1/calculators/durnin-womersley/calculate', [
            'sex' => 'male',
            'age_years' => 80,
            'skinfold_biceps_mm' => 6,
            'skinfold_triceps_mm' => 12,
            'skinfold_subscapular_mm' => 15,
            'skinfold_suprailiac_mm' => 14,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['age_years']);
    }
}
