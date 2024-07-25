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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('tag')->nullable();;
            $table->string('property')->nullable();;
            $table->string('address')->nullable();;
            $table->json('center')->nullable();;
            $table->integer('zoom')->nullable();;
            $table->string('title')->nullable();;
            $table->text('description')->nullable();;
            $table->integer('likes')->nullable();;
            $table->boolean('price')->nullable();
            $table->boolean('isHistorical')->nullable();
            $table->string('audioUrl')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
