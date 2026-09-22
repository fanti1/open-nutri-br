<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsentRequest;
use Illuminate\Http\JsonResponse;

class ConsentController extends Controller
{
    /**
     * Records LGPD consent (terms or privacy policy) with the version accepted,
     * timestamp and IP — an audit trail kept separate from the user's own
     * profile fields.
     */
    public function store(StoreConsentRequest $request): JsonResponse
    {
        $user = $request->user();

        $consent = $user->consents()->create([
            'type' => $request->validated('type'),
            'version' => $request->validated('version'),
            'accepted_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        $user->forceFill(['lgpd_consent_at' => now()])->save();

        return response()->json([
            'type' => $consent->type,
            'version' => $consent->version,
            'accepted_at' => $consent->accepted_at,
        ], 201);
    }
}
