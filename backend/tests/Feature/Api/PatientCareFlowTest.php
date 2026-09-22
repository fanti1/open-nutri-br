<?php

namespace Tests\Feature\Api;

use App\Models\Patient;
use App\Models\User;
use Database\Seeders\CalculatorCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PatientCareFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(CalculatorCatalogSeeder::class);
    }

    public function test_full_flow_create_patient_run_session_record_calculation_and_read_evolution(): void
    {
        $nutritionist = User::factory()->create();
        Sanctum::actingAs($nutritionist);

        $patient = $this->postJson('/api/v1/patients', [
            'name' => 'Maria Silva',
            'birth_date' => now()->subYears(40)->toDateString(),
            'sex' => 'female',
        ])->assertCreated()->json();

        $this->assertSame('adulto', $patient['life_stage']);

        $session = $this->postJson("/api/v1/patients/{$patient['id']}/sessions", [
            'occurred_at' => now()->toIso8601String(),
            'label' => 'Primeira consulta',
        ])->assertCreated()->json();

        $calculation = $this->postJson("/api/v1/sessions/{$session['id']}/calculations", [
            'calculator_slug' => 'imc',
            'inputs' => ['weight_kg' => 65, 'height_m' => 1.65],
        ])->assertCreated()->json();

        $this->assertEqualsWithDelta(23.88, $calculation['outputs']['values']['value'], 0.01);
        $this->assertSame('eutrofia', $calculation['outputs']['classification']);
        $this->assertDatabaseHas('calculation_results', [
            'patient_id' => $patient['id'],
            'calculator_slug' => 'imc',
        ]);

        $this->getJson("/api/v1/sessions/{$session['id']}/calculations")
            ->assertOk()
            ->assertJsonCount(1);

        // A second session a month later, to prove the evolution endpoint returns both in order.
        $laterSession = $this->postJson("/api/v1/patients/{$patient['id']}/sessions", [
            'occurred_at' => now()->addMonth()->toIso8601String(),
        ])->assertCreated()->json();

        $this->postJson("/api/v1/sessions/{$laterSession['id']}/calculations", [
            'calculator_slug' => 'imc',
            'inputs' => ['weight_kg' => 63, 'height_m' => 1.65],
        ])->assertCreated();

        $evolution = $this->getJson("/api/v1/patients/{$patient['id']}/calculations?calculator_slug=imc")
            ->assertOk()
            ->assertJsonCount(2)
            ->json();

        $this->assertEqualsWithDelta(23.88, $evolution[0]['outputs']['values']['value'], 0.01);
        $this->assertEqualsWithDelta(23.14, $evolution[1]['outputs']['values']['value'], 0.01);
    }

    public function test_a_nutritionist_cannot_access_another_nutritionists_patient(): void
    {
        $owner = User::factory()->create();
        $patient = Patient::factory()->for($owner)->create();

        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/v1/patients/{$patient->id}")->assertForbidden();
    }

    public function test_calculation_is_rejected_when_calculator_slug_is_unknown(): void
    {
        $nutritionist = User::factory()->create();
        Sanctum::actingAs($nutritionist);

        $patient = Patient::factory()->for($nutritionist)->create();
        $session = $patient->careSessions()->create([
            'user_id' => $nutritionist->id,
            'occurred_at' => now(),
        ]);

        $this->postJson("/api/v1/sessions/{$session->id}/calculations", [
            'calculator_slug' => 'not-a-real-calculator',
            'inputs' => ['anything' => 1],
        ])->assertNotFound();
    }

    public function test_available_calculators_are_narrowed_by_the_patients_life_stage(): void
    {
        $nutritionist = User::factory()->create();
        Sanctum::actingAs($nutritionist);

        $child = Patient::factory()->for($nutritionist)->create(['birth_date' => now()->subYears(8)]);
        $elderly = Patient::factory()->for($nutritionist)->create(['birth_date' => now()->subYears(70)]);

        $childSlugs = array_column($this->getJson("/api/v1/patients/{$child->id}/calculators")->assertOk()->json(), 'slug');
        $this->assertContains('oms-imc-idade-5-19', $childSlugs);
        $this->assertContains('holliday-segar', $childSlugs);
        $this->assertNotContains('mifflin-st-jeor', $childSlugs);
        $this->assertNotContains('glim', $childSlugs);

        $elderlySlugs = array_column($this->getJson("/api/v1/patients/{$elderly->id}/calculators")->assertOk()->json(), 'slug');
        $this->assertContains('mna-sf', $elderlySlugs);
        $this->assertContains('schofield', $elderlySlugs);
        $this->assertNotContains('oms-peso-idade-0-5', $elderlySlugs);
    }
}
