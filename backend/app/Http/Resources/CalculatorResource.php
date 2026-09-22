<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Calculator */
class CalculatorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'module' => $this->module,
            'category' => $this->category,
            'name' => $this->name,
            'short_description' => $this->short_description,
            'icon_key' => $this->icon_key,
            'formula_reference' => $this->formula_reference,
            'input_schema' => $this->input_schema,
            'life_stages' => $this->life_stages,
        ];
    }
}
