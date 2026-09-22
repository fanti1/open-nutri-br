<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_nutritionist_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ana Souza',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'crn_number' => '12345',
            'crn_state' => 'SP',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'ana@example.com')
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'ana@example.com']);
    }

    public function test_registration_requires_matching_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ana Souza',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'password_confirmation' => 'does-not-match',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    public function test_a_user_can_log_in_with_correct_credentials(): void
    {
        User::factory()->create([
            'email' => 'ana@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'ana@example.com',
            'password' => 'password123',
            'device_name' => 'phpunit',
        ]);

        $response->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'ana@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'ana@example.com',
            'password' => 'wrong-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_an_unauthenticated_request_to_a_protected_route_is_rejected(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }
}
