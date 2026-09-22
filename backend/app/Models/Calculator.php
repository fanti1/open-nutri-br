<?php

namespace App\Models;

use Database\Factories\CalculatorFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'slug', 'module', 'category', 'name', 'short_description',
    'icon_key', 'formula_reference', 'input_schema', 'life_stages',
    'sort_order', 'active',
])]
class Calculator extends Model
{
    /** @use HasFactory<CalculatorFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'input_schema' => 'array',
            'life_stages' => 'array',
            'active' => 'boolean',
        ];
    }
}
