<?php

namespace App\Http\Controllers\Api;

use App\Domain\Calculators\Support\LifeStageResolver;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Http\Resources\CalculatorResource;
use App\Http\Resources\PatientResource;
use App\Models\Calculator;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PatientController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $patients = $request->user()->patients()
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return PatientResource::collection($patients);
    }

    public function store(StorePatientRequest $request): PatientResource
    {
        $patient = $request->user()->patients()->create($request->validated());

        return new PatientResource($patient);
    }

    public function show(Patient $patient): PatientResource
    {
        $this->authorize('view', $patient);

        return new PatientResource($patient);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): PatientResource
    {
        $this->authorize('update', $patient);

        $patient->update($request->validated());

        return new PatientResource($patient);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $this->authorize('delete', $patient);

        $patient->delete();

        return response()->json(status: 204);
    }

    /**
     * The calculator catalog narrowed to whatever is scientifically validated
     * for this specific patient's age — the app surfaces this instead of the
     * full list whenever a calculation is started from inside a patient record,
     * so it is always obvious the patient is being treated as child/adult/elderly.
     */
    public function availableCalculators(Patient $patient): AnonymousResourceCollection
    {
        $this->authorize('view', $patient);

        $lifeStage = LifeStageResolver::fromAge($patient->birth_date->age)->value;

        $calculators = Calculator::query()
            ->where('active', true)
            ->whereJsonContains('life_stages', $lifeStage)
            ->orderBy('sort_order')
            ->get();

        return CalculatorResource::collection($calculators);
    }
}
