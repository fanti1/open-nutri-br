<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCareSessionRequest extends FormRequest
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
            'module' => ['sometimes', 'in:ambulatorio'],
            'label' => ['nullable', 'string', 'max:255'],
            'occurred_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
