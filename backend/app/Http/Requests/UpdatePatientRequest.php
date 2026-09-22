<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'birth_date' => ['sometimes', 'date', 'before_or_equal:today'],
            'sex' => ['sometimes', 'in:male,female'],
            'cpf' => ['sometimes', 'nullable', 'string', 'max:20'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'in:active,archived'],
        ];
    }
}
