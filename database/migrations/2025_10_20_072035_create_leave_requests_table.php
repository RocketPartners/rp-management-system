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
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();

            // User & Leave Type
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained()->onDelete('cascade');

            // Leave Duration
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_days', 5, 1); // e.g., 5.5 days
            $table->enum('duration', ['full_day', 'half_day_am', 'half_day_pm', 'custom_hours'])->default('full_day');
            $table->time('custom_start_time')->nullable();
            $table->time('custom_end_time')->nullable();

            // Leave Details
            $table->text('reason');
            $table->string('attachment')->nullable(); // Supporting document

            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->boolean('use_default_emergency_contact')->default(false);
            $table->enum('availability', ['reachable', 'offline', 'emergency_only'])->default('reachable');

            // Approval Workflow
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('manager_approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('manager_approved_at')->nullable();
            $table->text('manager_comments')->nullable();

            $table->foreignId('hr_approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('hr_approved_at')->nullable();
            $table->text('hr_comments')->nullable();

            // Status
            $table->enum('status', [
                'pending_manager',
                'pending_hr',
                'approved',
                'rejected_by_manager',
                'rejected_by_hr',
                'appealed',
                'cancelled',
            ])->default('pending_manager');

            // Appeal Information
            $table->text('appeal_reason')->nullable();
            $table->timestamp('appealed_at')->nullable();
            $table->string('appeal_attachment')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('user_id');
            $table->index('leave_type_id');
            $table->index('manager_id');
            $table->index('status');
            $table->index('start_date');
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
