<?php

namespace App\Models;

use Database\Factories\CalculationResultFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['patient_id', 'user_id', 'calculator_slug', 'formula_version', 'inputs', 'outputs'])]
class CalculationResult extends Model
{
    /** @use HasFactory<CalculationResultFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * @return BelongsTo<CareSession, $this>
     */
    public function careSession(): BelongsTo
    {
        return $this->belongsTo(CareSession::class);
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'inputs' => 'array',
            'outputs' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
