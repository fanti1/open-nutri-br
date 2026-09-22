<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\CareSession */
class CareSessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'module' => $this->module,
            'label' => $this->label,
            'occurred_at' => $this->occurred_at,
            'notes' => $this->notes,
            'status' => $this->status,
        ];
    }
}
