<?php

namespace Tests\Feature;

use App\Models\Calculator;
use Database\Seeders\CalculatorCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Guards against a real bug found during development: Illuminate\Validation\Rules\In
 * is not JSON-serializable, so a calculator using Rule::in(...) in its
 * inputsSchema() silently lost its allowed values once stored (and re-read)
 * as JSON in the calculators.input_schema column — the app would render a
 * select field with no options. Calculators must use a plain 'in:a,b,c'
 * string instead, which survives the JSON round-trip.
 */
class CalculatorCatalogSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_input_schema_survives_the_json_round_trip_for_every_calculator(): void
    {
        $this->seed(CalculatorCatalogSeeder::class);

        foreach (Calculator::all() as $calculator) {
            foreach ($calculator->input_schema as $field => $rules) {
                foreach ($rules as $rule) {
                    if (is_string($rule) && str_starts_with($rule, 'in:')) {
                        $this->assertNotSame('in:', $rule, "Calculator [{$calculator->slug}] field [{$field}] has an 'in:' rule with no options after the JSON round-trip.");
                    }
                }
            }
        }
    }
}
