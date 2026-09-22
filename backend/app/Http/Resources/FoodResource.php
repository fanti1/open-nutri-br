<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Food */
class FoodResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source' => $this->source,
            'name' => $this->name,
            'food_group' => $this->food_group,
            'energy_kcal' => $this->energy_kcal,
            'protein_g' => $this->protein_g,
            'carbohydrate_g' => $this->carbohydrate_g,
            'lipid_g' => $this->lipid_g,
            'fiber_g' => $this->fiber_g,
            'saturated_fat_g' => $this->saturated_fat_g,
            'monounsaturated_fat_g' => $this->monounsaturated_fat_g,
            'polyunsaturated_fat_g' => $this->polyunsaturated_fat_g,
            'cholesterol_mg' => $this->cholesterol_mg,
            'calcium_mg' => $this->calcium_mg,
            'iron_mg' => $this->iron_mg,
            'sodium_mg' => $this->sodium_mg,
            'potassium_mg' => $this->potassium_mg,
            'vitamin_a_mcg' => $this->vitamin_a_mcg,
            'vitamin_c_mg' => $this->vitamin_c_mg,
            'household_portion' => $this->household_portion,
        ];
    }
}
