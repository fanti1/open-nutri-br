<?php

namespace App\Models;

use Database\Factories\FoodFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'source', 'source_code', 'name', 'name_search', 'food_group',
    'energy_kcal', 'protein_g', 'carbohydrate_g', 'lipid_g', 'fiber_g',
    'saturated_fat_g', 'monounsaturated_fat_g', 'polyunsaturated_fat_g', 'cholesterol_mg',
    'calcium_mg', 'iron_mg', 'sodium_mg', 'potassium_mg',
    'vitamin_a_mcg', 'vitamin_c_mg', 'household_portion',
])]
class Food extends Model
{
    /** @use HasFactory<FoodFactory> */
    use HasFactory;

    // Laravel's pluralizer treats "food" as uncountable and would otherwise guess "food" as the table name.
    protected $table = 'foods';

    protected function casts(): array
    {
        return [
            'energy_kcal' => 'decimal:2',
            'protein_g' => 'decimal:2',
            'carbohydrate_g' => 'decimal:2',
            'lipid_g' => 'decimal:2',
            'fiber_g' => 'decimal:2',
            'saturated_fat_g' => 'decimal:2',
            'monounsaturated_fat_g' => 'decimal:2',
            'polyunsaturated_fat_g' => 'decimal:2',
            'cholesterol_mg' => 'decimal:2',
            'calcium_mg' => 'decimal:2',
            'iron_mg' => 'decimal:2',
            'sodium_mg' => 'decimal:2',
            'potassium_mg' => 'decimal:2',
            'vitamin_a_mcg' => 'decimal:2',
            'vitamin_c_mg' => 'decimal:2',
        ];
    }
}
