<?php

namespace Database\Factories;

use App\Models\CareSession;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CareSession>
 */
class CareSessionFactory extends Factory
{
    protected $model = CareSession::class;

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
            'module' => 'ambulatorio',
            'label' => fake()->words(3, true),
            'occurred_at' => now(),
            'notes' => null,
            'status' => 'open',
        ];
    }
}
