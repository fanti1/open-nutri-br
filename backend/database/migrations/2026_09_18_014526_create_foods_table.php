<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('foods', function (Blueprint $table) {
            $table->id();
            $table->string('source');
            $table->string('source_code');
            $table->string('name');
            $table->string('name_search');
            $table->string('food_group')->nullable();
            $table->decimal('energy_kcal', 8, 2)->nullable();
            $table->decimal('protein_g', 8, 2)->nullable();
            $table->decimal('carbohydrate_g', 8, 2)->nullable();
            $table->decimal('lipid_g', 8, 2)->nullable();
            $table->decimal('fiber_g', 8, 2)->nullable();
            $table->decimal('saturated_fat_g', 8, 2)->nullable();
            $table->decimal('monounsaturated_fat_g', 8, 2)->nullable();
            $table->decimal('polyunsaturated_fat_g', 8, 2)->nullable();
            $table->decimal('cholesterol_mg', 8, 2)->nullable();
            $table->decimal('calcium_mg', 8, 2)->nullable();
            $table->decimal('iron_mg', 8, 2)->nullable();
            $table->decimal('sodium_mg', 8, 2)->nullable();
            $table->decimal('potassium_mg', 8, 2)->nullable();
            $table->decimal('vitamin_a_mcg', 8, 2)->nullable();
            $table->decimal('vitamin_c_mg', 8, 2)->nullable();
            $table->string('household_portion')->nullable();
            $table->timestamps();

            $table->unique(['source', 'source_code']);
            $table->index('name_search');
            $table->index('food_group');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foods');
    }
};
