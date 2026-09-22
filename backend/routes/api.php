<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalculationController;
use App\Http\Controllers\Api\CalculatorController;
use App\Http\Controllers\Api\CareSessionController;
use App\Http\Controllers\Api\ConsentController;
use App\Http\Controllers\Api\FoodController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    // Abertos a todos, sem conta: catálogo/cálculo de calculadoras e tabela de
    // alimentos não envolvem dados pessoais (os dados do paciente ficam no aparelho).
    Route::middleware('throttle:120,1')->group(function () {
        Route::get('calculators', [CalculatorController::class, 'index']);
        Route::get('calculators/{calculator:slug}', [CalculatorController::class, 'show']);
        Route::post('calculators/{calculator:slug}/calculate', [CalculatorController::class, 'calculate']);

        Route::get('foods', [FoodController::class, 'index']);
        Route::get('foods/{food}', [FoodController::class, 'show']);
    });

    // Conta na nuvem (opcional, não usada pelo app local-first atual).
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        Route::get('profile', [ProfileController::class, 'show']);
        Route::put('profile', [ProfileController::class, 'update']);

        Route::delete('account', [AccountController::class, 'destroy']);
        Route::get('account/export', [AccountController::class, 'export']);

        Route::post('consents', [ConsentController::class, 'store']);

        Route::apiResource('patients', PatientController::class);
        Route::get('patients/{patient}/calculators', [PatientController::class, 'availableCalculators']);
        Route::get('patients/{patient}/calculations', [CalculationController::class, 'evolution']);

        Route::get('patients/{patient}/sessions', [CareSessionController::class, 'index']);
        Route::post('patients/{patient}/sessions', [CareSessionController::class, 'store']);
        Route::get('sessions/{session}', [CareSessionController::class, 'show']);
        Route::put('sessions/{session}', [CareSessionController::class, 'update']);
        Route::delete('sessions/{session}', [CareSessionController::class, 'destroy']);

        Route::get('sessions/{session}/calculations', [CalculationController::class, 'index']);
        Route::post('sessions/{session}/calculations', [CalculationController::class, 'store']);
        Route::get('sessions/{session}/report.pdf', [CareSessionController::class, 'report']);
    });
});
