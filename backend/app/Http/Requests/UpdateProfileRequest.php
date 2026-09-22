<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'crn_number' => ['sometimes', 'nullable', 'string', 'max:30'],
            'crn_state' => ['sometimes', 'nullable', 'string', 'size:2'],
            'specialty' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
