<?php

namespace App\Models;

use Database\Factories\CareSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['user_id', 'module', 'label', 'occurred_at', 'notes', 'status'])]
class CareSession extends Model
{
    /** @use HasFactory<CareSessionFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'care_sessions';

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

    /**
     * @return HasMany<CalculationResult, $this>
     */
    public function calculationResults(): HasMany
    {
        return $this->hasMany(CalculationResult::class);
    }

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
        ];
    }
}
