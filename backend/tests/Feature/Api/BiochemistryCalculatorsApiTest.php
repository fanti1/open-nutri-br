<?php

namespace Tests\Feature\Api;

use Database\Seeders\CalculatorCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BiochemistryCalculatorsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(CalculatorCatalogSeeder::class);
    }

    public function test_glycemic_diagnosis_accepts_a_single_exam(): void
    {
        $this->postJson('/api/v1/calculators/glicemia-diagnostico/calculate', ['hba1c_percent' => 6.5])
            ->assertOk()
            ->assertJsonPath('values.hba1c_percent', 6.5)
            ->assertJsonPath('classification', 'compativel_com_diabetes');
    }

    public function test_glycemic_diagnosis_requires_at_least_one_exam(): void
    {
        $this->postJson('/api/v1/calculators/glicemia-diagnostico/calculate', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['fasting_glucose_mg_dl', 'hba1c_percent', 'ogtt_2h_mg_dl']);
    }

    public function test_lipid_profile_omits_friedewald_ldl_when_triglycerides_reach_400(): void
    {
        $response = $this->postJson('/api/v1/calculators/perfil-lipidico/calculate', [
            'total_cholesterol_mg_dl' => 250,
            'hdl_mg_dl' => 35,
            'triglycerides_mg_dl' => 400,
            'fasting' => true,
        ])->assertOk();

        $this->assertArrayNotHasKey('ldl_mg_dl', $response->json('values'));
        $response->assertJsonPath('values.non_hdl_mg_dl', 215);
    }

    public function test_ckd_epi_is_restricted_to_adults(): void
    {
        $this->postJson('/api/v1/calculators/ckd-epi-2021/calculate', [
            'creatinine_mg_dl' => 0.6,
            'age_years' => 12,
            'sex' => 'female',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['age_years']);
    }
}
