<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\PurgeAccountJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    private const PURGE_GRACE_PERIOD_DAYS = 30;

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->tokens()->delete();
        $user->delete();

        PurgeAccountJob::dispatch($user->id)->delay(now()->addDays(self::PURGE_GRACE_PERIOD_DAYS));

        return response()->json(status: 204);
    }

    /**
     * LGPD data portability export: every record this account owns, in one JSON payload.
     */
    public function export(Request $request): JsonResponse
    {
        $user = $request->user();

        $patients = $user->patients()
            ->with(['careSessions.calculationResults', 'calculationResults'])
            ->get();

        return response()->json([
            'exported_at' => now()->toIso8601String(),
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'crn_number' => $user->crn_number,
                'crn_state' => $user->crn_state,
                'specialty' => $user->specialty,
            ],
            'patients' => $patients,
        ]);
    }
}
