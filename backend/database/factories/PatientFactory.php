<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->name(),
            'birth_date' => fake()->dateTimeBetween('-90 years', '-1 years')->format('Y-m-d'),
            'sex' => fake()->randomElement(['male', 'female']),
            'cpf' => null,
            'notes' => null,
            'status' => 'active',
        ];
    }
}
