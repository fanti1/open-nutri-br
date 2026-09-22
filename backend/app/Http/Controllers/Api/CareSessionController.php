<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCareSessionRequest;
use App\Http\Requests\UpdateCareSessionRequest;
use App\Http\Resources\CareSessionResource;
use App\Models\CareSession;
use App\Models\Patient;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class CareSessionController extends Controller
{
    public function index(Patient $patient): AnonymousResourceCollection
    {
        $this->authorize('view', $patient);

        $sessions = $patient->careSessions()->orderByDesc('occurred_at')->get();

        return CareSessionResource::collection($sessions);
    }

    public function store(StoreCareSessionRequest $request, Patient $patient): CareSessionResource
    {
        $this->authorize('view', $patient);

        $session = $patient->careSessions()->create([
            ...$request->validated(),
            'user_id' => $patient->user_id,
        ]);

        return new CareSessionResource($session);
    }

    public function show(CareSession $session): CareSessionResource
    {
        $this->authorize('view', $session);

        return new CareSessionResource($session);
    }

    public function update(UpdateCareSessionRequest $request, CareSession $session): CareSessionResource
    {
        $this->authorize('update', $session);

        $session->update($request->validated());

        return new CareSessionResource($session);
    }

    public function destroy(CareSession $session): JsonResponse
    {
        $this->authorize('delete', $session);

        $session->delete();

        return response()->json(status: 204);
    }

    public function report(CareSession $session): Response
    {
        $this->authorize('view', $session);

        $session->load(['patient', 'calculationResults']);

        $pdf = Pdf::loadView('reports.session', ['session' => $session]);

        return $pdf->download("atendimento-{$session->id}.pdf");
    }
}
