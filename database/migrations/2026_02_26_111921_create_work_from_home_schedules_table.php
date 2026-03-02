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
        Schema::create('work_from_home_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('type', ['one_time', 'recurring'])->default('one_time');
            $table->tinyInteger('recurring_day_of_week')->nullable(); // 1=Monday, 7=Sunday
            $table->enum('status', ['pending', 'approved', 'cancelled'])->default('approved');
            $table->text('reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            // Indexes for better query performance
            $table->index(['user_id', 'date']);
            $table->index(['date', 'status']);
            $table->index('status');

            // Prevent duplicate WFH on same date for same user
            $table->unique(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_from_home_schedules');
    }
};
