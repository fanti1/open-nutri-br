<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calculation_results', function (Blueprint $table) {
            $table->id();
            // Nullable: a calculation can be run standalone (not tied to a patient session).
            $table->foreignId('care_session_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('calculator_slug');
            $table->string('formula_version');
            $table->json('inputs');
            $table->json('outputs');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['patient_id', 'calculator_slug', 'created_at']);
            $table->index(['care_session_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calculation_results');
    }
};
