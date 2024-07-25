<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('yookassa_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id')->nullable();
            $table->string('payment_id')->unique();
            $table->string('order_id');
            $table->dateTime('paid_at')->nullable();
            $table->string('confirmation_url')->nullable();
            $table->enum('status', ['pending', 'waiting_for_capture', 'succeeded', 'canceled', 'refunded', 'partial_refunded'])->nullable();
            $table->enum('status_refund', ['not_refunded', 'refunded', 'partial_refunded'])->default('not_refunded');
            $table->unsignedFloat('amount');
            $table->unsignedFloat('refund_amount')->default(0);
            $table->string('currency');
            $table->string('description')->nullable();
            $table->json('metadata')->nullable();
            $table->unsignedInteger('recipient_account_id')->nullable();
            $table->unsignedInteger('recipient_gateway_id')->nullable();
            $table->boolean('is_refundable')->default(false);
            $table->boolean('is_test')->default(false);
            $table->boolean('is_paid')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('yookassa_payments');
    }
};
