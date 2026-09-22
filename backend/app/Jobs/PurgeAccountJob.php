<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * LGPD account deletion runs in two steps: the controller soft-deletes
 * immediately (so the account stops working right away and the deletion is
 * reversible during a grace period), and this job permanently purges the
 * user row after that period — which cascades (DB-level ON DELETE CASCADE)
 * to patients, care_sessions, calculation_results and consents.
 */
class PurgeAccountJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $userId,
    ) {}

    public function handle(): void
    {
        User::withTrashed()->where('id', $this->userId)->first()?->forceDelete();
    }
}
