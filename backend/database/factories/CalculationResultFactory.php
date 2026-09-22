<?php

namespace Database\Factories;

use App\Models\CalculationResult;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CalculationResult>
 */
class CalculationResultFactory extends Factory
{
    protected $model = CalculationResult::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'user_id' => function (array $attributes) {
                return Patient::findOrFail($attributes['patient_id'])->user_id;
            },
            'calculator_slug' => 'imc',
            'formula_version' => 'v1',
            'inputs' => ['weight_kg' => 70, 'height_m' => 1.75],
            'outputs' => ['value' => 22.86, 'classification' => 'eutrofia'],
            'created_at' => now(),
        ];
    }
}
