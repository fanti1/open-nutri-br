<?php

namespace Tests\Feature\Api;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_nutritionist_can_update_their_profile(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/profile', [
            'crn_number' => '98765',
            'crn_state' => 'RJ',
        ]);

        $response->assertOk()
            ->assertJsonPath('crn_number', '98765')
            ->assertJsonPath('crn_state', 'RJ');
    }

    public function test_account_export_includes_patients_and_their_calculation_history(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Patient::factory()->for($user)->create(['name' => 'Paciente Teste']);

        $response = $this->getJson('/api/v1/account/export');

        $response->assertOk()
            ->assertJsonPath('profile.email', $user->email)
            ->assertJsonCount(1, 'patients');
    }

    public function test_deleting_an_account_soft_deletes_it_revokes_tokens_and_schedules_a_purge(): void
    {
        Bus::fake();

        $user = User::factory()->create();
        $token = $user->createToken('mobile')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/v1/account');

        $response->assertNoContent();

        $this->assertSoftDeleted('users', ['id' => $user->id]);
        $this->assertDatabaseCount('personal_access_tokens', 0);

        Bus::assertDispatched(\App\Jobs\PurgeAccountJob::class, fn ($job) => $job->userId === $user->id);
    }
}
