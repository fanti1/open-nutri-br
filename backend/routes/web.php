<?php

use Illuminate\Support\Facades\Route;

// O backend é a implementação de referência das fórmulas; a API fica em /api/v1.
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'api' => url('/api/v1/calculators'),
]));
