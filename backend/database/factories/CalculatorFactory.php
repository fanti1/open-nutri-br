<?php

namespace Database\Factories;

use App\Models\Calculator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Calculator>
 */
class CalculatorFactory extends Factory
{
    protected $model = Calculator::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'module' => 'ambulatorio',
            'category' => 'antropometria',
            'name' => fake()->words(2, true),
            'short_description' => fake()->sentence(),
            'icon_key' => 'calculator',
            'formula_reference' => 'Reference, Author, Year',
            'input_schema' => [],
            'sort_order' => 0,
            'active' => true,
        ];
    }
}
