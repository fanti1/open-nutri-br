<?php

namespace App\Http\Controllers\Api;

use App\Domain\Calculators\CalculatorRegistry;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCalculationRequest;
use App\Http\Resources\CalculationResultResource;
use App\Models\CareSession;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Validator;

class CalculationController extends Controller
{
    public function __construct(
        private readonly CalculatorRegistry $registry,
    ) {}

    public function index(CareSession $session): AnonymousResourceCollection
    {
        $this->authorize('view', $session);

        $results = $session->calculationResults()->orderBy('created_at')->get();

        return CalculationResultResource::collection($results);
    }

    /**
     * Persists a calculation against a patient session. The raw inputs are
     * revalidated and recalculated here — the server is the authoritative
     * source for anything stored against a patient, even though the app also
     * computes the same result locally for instant UX.
     */
    public function store(StoreCalculationRequest $request, CareSession $session): CalculationResultResource
    {
        $this->authorize('update', $session);

        $engine = $this->registry->get((string) $request->input('calculator_slug'));
        $inputs = Validator::make($request->input('inputs', []), $engine->inputsSchema())->validate();

        $outcome = $engine->calculate($inputs);

        $result = $session->calculationResults()->create([
            'patient_id' => $session->patient_id,
            'user_id' => $session->user_id,
            'calculator_slug' => $engine->slug(),
            'formula_version' => $outcome->formulaVersion,
            'inputs' => $inputs,
            'outputs' => [
                'values' => $outcome->values,
                'classification' => $outcome->classification,
            ],
        ]);

        return new CalculationResultResource($result);
    }

    /**
     * Evolution view: every past result for one calculator on one patient,
     * oldest first, so the app can plot progress across sessions.
     */
    public function evolution(Request $request, Patient $patient): AnonymousResourceCollection
    {
        $this->authorize('view', $patient);

        $query = $patient->calculationResults()->orderBy('created_at');

        if ($slug = $request->query('calculator_slug')) {
            $query->where('calculator_slug', $slug);
        }

        return CalculationResultResource::collection($query->get());
    }
}
