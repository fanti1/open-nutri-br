<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FoodResource;
use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class FoodController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Food::query();

        if ($search = $request->query('search')) {
            $normalized = Str::of($search)->ascii()->lower()->toString();
            $query->where('name_search', 'like', "%{$normalized}%");
        }

        if ($group = $request->query('group')) {
            $query->where('food_group', $group);
        }

        if ($source = $request->query('source')) {
            $query->where('source', $source);
        }

        $foods = $query->orderBy('name')->paginate(30);

        return FoodResource::collection($foods);
    }

    public function show(Food $food): FoodResource
    {
        return new FoodResource($food);
    }
}
