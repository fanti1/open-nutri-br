<?php

namespace App\Http\Resources;

use App\Domain\Calculators\Support\LifeStageResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Patient */
class PatientResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $ageYears = $this->birth_date->age;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'birth_date' => $this->birth_date->toDateString(),
            'age_years' => $ageYears,
            // Deriva crianca/adulto/idoso da idade, para a UI sempre deixar claro
            // para qual público o paciente conta e quais calculadoras se aplicam.
            'life_stage' => LifeStageResolver::fromAge($ageYears)->value,
            'sex' => $this->sex,
            'cpf' => $this->cpf,
            'notes' => $this->notes,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
