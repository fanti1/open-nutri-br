<?php

namespace App\Http\Controllers\Api;

use App\Domain\Calculators\CalculatorRegistry;
use App\Http\Controllers\Controller;
use App\Http\Resources\CalculatorResource;
use App\Models\Calculator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Validator;

class CalculatorController extends Controller
{
    public function __construct(
        private readonly CalculatorRegistry $registry,
    ) {}

    /**
     * Lists the calculator catalog (drives the app's Home screen). Filterable by
     * module, category, a free-text search, and life_stage (crianca/adulto/idoso)
     * so the nutritionist can see at a glance which calculators fit the patient
     * they are working with.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Calculator::query()->where('active', true);

        if ($module = $request->query('module')) {
            $query->where('module', $module);
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($lifeStage = $request->query('life_stage')) {
            $query->whereJsonContains('life_stages', $lifeStage);
        }

        $calculators = $query->orderBy('sort_order')->get();

        return CalculatorResource::collection($calculators);
    }

    public function show(Calculator $calculator): CalculatorResource
    {
        return new CalculatorResource($calculator);
    }

    /**
     * Standalone calculation: validates against the calculator's own inputsSchema
     * and returns the result without persisting anything (free-tier usage,
     * quick lookups outside of a patient session).
     */
    public function calculate(Request $request, Calculator $calculator): array
    {
        $engine = $this->registry->get($calculator->slug);

        $inputs = Validator::make($request->all(), $engine->inputsSchema())->validate();

        return $engine->calculate($inputs)->toArray();
    }
}
