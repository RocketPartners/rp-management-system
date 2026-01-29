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
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();

            // User and Leave Type
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained()->onDelete('cascade');

            // Year (balances are per year: 2024, 2025, etc.)
            $table->year('year');

            // Leave Balance Tracking
            $table->decimal('total_days', 5, 1)->default(0);        // Total allocated (15.0 VL days)
            $table->decimal('used_days', 5, 1)->default(0);         // Days used (5.0 days)
            $table->decimal('remaining_days', 5, 1)->default(0);    // Days left (10.0 days)

            // Carry Over from Previous Year
            $table->decimal('carried_over_days', 5, 1)->default(0); // Days carried from prev year

            // Adjustments (manual corrections by HR)
            $table->decimal('adjustment_days', 5, 1)->default(0);   // +/- manual adjustment
            $table->string('adjustment_reason')->nullable();         // Why adjusted
            $table->foreignId('adjusted_by')->nullable()->constrained('users'); // Who adjusted

            $table->timestamps();

            // Unique constraint: One balance per user per leave type per year
            $table->unique(['user_id', 'leave_type_id', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_balances');
    }
};
