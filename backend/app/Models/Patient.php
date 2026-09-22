<?php

namespace App\Models;

use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'birth_date', 'sex', 'cpf', 'notes', 'status'])]
class Patient extends Model
{
    /** @use HasFactory<PatientFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<CareSession, $this>
     */
    public function careSessions(): HasMany
    {
        return $this->hasMany(CareSession::class);
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
            'name' => 'encrypted',
            'cpf' => 'encrypted',
            'notes' => 'encrypted',
            'birth_date' => 'date',
        ];
    }
}
