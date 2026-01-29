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
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name');                                    // "Vacation Leave"
            $table->string('code')->unique();                         // "VL"
            $table->text('description')->nullable();                  // "Annual paid vacation time"

            // Leave Allocation (ADMIN CAN EDIT THESE)
            $table->integer('days_per_year')->default(0);            // 15 for VL, 7 for SL, etc.
            $table->boolean('is_paid')->default(true);               // Paid or unpaid leave

            // Medical Certificate Requirements
            $table->boolean('requires_medical_cert')->default(false);
            $table->integer('medical_cert_days_threshold')->nullable(); // Require cert if > X days

            // Carry Over Rules
            $table->boolean('is_carry_over_allowed')->default(false); // Can unused days carry to next year?
            $table->integer('max_carry_over_days')->nullable();       // Max days to carry over

            // Approval Workflow
            $table->boolean('requires_manager_approval')->default(true);
            $table->boolean('requires_hr_approval')->default(true);

            // UI Configuration
            $table->string('color')->default('#3B82F6');             // Hex color for badges
            $table->string('icon')->nullable();                       // Lucide icon name
            $table->integer('sort_order')->default(0);                // Display order in dropdown

            // Gender-Specific Leave (for maternity/paternity)
            $table->enum('gender_specific', ['male', 'female'])->nullable();

            // Status
            $table->boolean('is_active')->default(true);              // Admin can enable/disable

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
