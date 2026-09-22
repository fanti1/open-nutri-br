<?php

namespace App\Imports;

use App\Models\Food;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithUpserts;
use Maatwebsite\Excel\Concerns\WithValidation;

/**
 * Expects a CSV/XLSX already normalized to these column headers (the official
 * TACO spreadsheet ships irregular multi-row headers per food group and must
 * be flattened to this shape first — see docs/data/taco-import.md):
 * source_code, name, food_group, energy_kcal, protein_g, carbohydrate_g,
 * lipid_g, fiber_g, saturated_fat_g, monounsaturated_fat_g,
 * polyunsaturated_fat_g, cholesterol_mg, calcium_mg, iron_mg, sodium_mg,
 * potassium_mg, vitamin_a_mcg, vitamin_c_mg, household_portion.
 *
 * "NA" and "Tr" (trace) cells — TACO's own notation for "not analyzed" and
 * "trace amount" — are normalized to null before validation.
 */
class TacoFoodsImport implements ToModel, WithHeadingRow, WithUpserts, WithValidation
{
    /**
     * Re-running the import (e.g. after an official TACO revision) updates
     * existing rows by (source, source_code) instead of duplicating them.
     *
     * @return list<string>
     */
    public function uniqueBy(): array
    {
        return ['source', 'source_code'];
    }

    /**
     * @param  array<string, mixed>  $row
     */
    public function model(array $row): Food
    {
        $name = trim((string) $row['name']);

        return new Food([
            'source' => 'taco',
            'source_code' => (string) $row['source_code'],
            'name' => $name,
            'name_search' => Str::of($name)->ascii()->lower()->toString(),
            'food_group' => $row['food_group'] ?? null,
            'energy_kcal' => $this->numericOrNull($row['energy_kcal'] ?? null),
            'protein_g' => $this->numericOrNull($row['protein_g'] ?? null),
            'carbohydrate_g' => $this->numericOrNull($row['carbohydrate_g'] ?? null),
            'lipid_g' => $this->numericOrNull($row['lipid_g'] ?? null),
            'fiber_g' => $this->numericOrNull($row['fiber_g'] ?? null),
            'saturated_fat_g' => $this->numericOrNull($row['saturated_fat_g'] ?? null),
            'monounsaturated_fat_g' => $this->numericOrNull($row['monounsaturated_fat_g'] ?? null),
            'polyunsaturated_fat_g' => $this->numericOrNull($row['polyunsaturated_fat_g'] ?? null),
            'cholesterol_mg' => $this->numericOrNull($row['cholesterol_mg'] ?? null),
            'calcium_mg' => $this->numericOrNull($row['calcium_mg'] ?? null),
            'iron_mg' => $this->numericOrNull($row['iron_mg'] ?? null),
            'sodium_mg' => $this->numericOrNull($row['sodium_mg'] ?? null),
            'potassium_mg' => $this->numericOrNull($row['potassium_mg'] ?? null),
            'vitamin_a_mcg' => $this->numericOrNull($row['vitamin_a_mcg'] ?? null),
            'vitamin_c_mg' => $this->numericOrNull($row['vitamin_c_mg'] ?? null),
            'household_portion' => $row['household_portion'] ?? null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'source_code' => ['required'],
            'name' => ['required', 'string'],
        ];
    }

    private function numericOrNull(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        // TACO's own notation: "NA" = não analisado, "Tr" = traço (quantidade insignificante).
        if (in_array(trim((string) $value), ['NA', 'Tr', '*'], true)) {
            return null;
        }

        return is_numeric($value) ? (float) $value : null;
    }
}
