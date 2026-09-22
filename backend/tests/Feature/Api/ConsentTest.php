<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConsentTest extends TestCase
{
    use RefreshDatabase;

    public function test_recording_consent_creates_an_audit_row_and_stamps_the_user(): void
    {
        $user = User::factory()->create(['lgpd_consent_at' => null]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/consents', [
            'type' => 'privacy',
            'version' => '1.0',
        ]);

        $response->assertCreated()->assertJsonPath('type', 'privacy');

        $this->assertDatabaseHas('consents', [
            'user_id' => $user->id,
            'type' => 'privacy',
            'version' => '1.0',
        ]);

        $this->assertNotNull($user->fresh()->lgpd_consent_at);
    }
}
