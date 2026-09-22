<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\CalculationResult */
class CalculationResultResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'care_session_id' => $this->care_session_id,
            'patient_id' => $this->patient_id,
            'calculator_slug' => $this->calculator_slug,
            'formula_version' => $this->formula_version,
            'inputs' => $this->inputs,
            'outputs' => $this->outputs,
            'created_at' => $this->created_at,
        ];
    }
}
