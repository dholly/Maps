<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();;
            $table->text('description')->nullable();;
            $table->json('coordinates')->nullable();;
            $table->string('color')->nullable();;
            $table->string('distance')->nullable();;
            $table->string('duration')->nullable();;
            $table->string('district')->nullable();;
            $table->boolean('price')->nullable();;
            $table->json('pointsOfInterest')->nullable();;
            $table->string('imageUrl')->nullable();
            $table->integer('likes')->nullable();;
            $table->date('createdAt')->nullable();;
            $table->json('steps')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
