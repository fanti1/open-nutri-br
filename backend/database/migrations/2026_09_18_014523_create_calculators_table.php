<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calculators', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('module');
            $table->string('category');
            $table->string('name');
            $table->string('short_description')->nullable();
            $table->string('icon_key')->nullable();
            $table->string('formula_reference');
            $table->json('input_schema');
            // Faixas etárias em que o método é cientificamente validado: crianca, adulto, idoso.
            $table->json('life_stages');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['module', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calculators');
    }
};
