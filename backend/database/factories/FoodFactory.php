<?php

namespace Database\Factories;

use App\Models\Food;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Food>
 */
class FoodFactory extends Factory
{
    protected $model = Food::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'source' => 'taco',
            'source_code' => fake()->unique()->numerify('###'),
            'name' => $name,
            'name_search' => Str::of($name)->ascii()->lower()->toString(),
            'food_group' => fake()->randomElement(['Cereais', 'Frutas', 'Verduras', 'Carnes', 'Laticínios']),
            'energy_kcal' => fake()->randomFloat(2, 10, 900),
            'protein_g' => fake()->randomFloat(2, 0, 30),
            'carbohydrate_g' => fake()->randomFloat(2, 0, 80),
            'lipid_g' => fake()->randomFloat(2, 0, 40),
            'fiber_g' => fake()->randomFloat(2, 0, 15),
        ];
    }
}
