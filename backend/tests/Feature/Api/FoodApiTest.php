<?php

namespace Tests\Feature\Api;

use App\Models\Food;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FoodApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create());
    }

    public function test_searches_foods_ignoring_accents_and_case(): void
    {
        Food::factory()->create(['name' => 'Arroz integral cozido', 'name_search' => 'arroz integral cozido']);
        Food::factory()->create(['name' => 'Feijão preto cozido', 'name_search' => 'feijao preto cozido']);

        $response = $this->getJson('/api/v1/foods?search=feijao');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Feijão preto cozido'));
        $this->assertFalse($names->contains('Arroz integral cozido'));
    }

    public function test_shows_a_single_food_with_full_nutritional_detail(): void
    {
        $food = Food::factory()->create(['energy_kcal' => 130.5]);

        $response = $this->getJson("/api/v1/foods/{$food->id}");

        $response->assertOk()->assertJsonPath('energy_kcal', '130.50');
    }
}
