<?php

// ============================================
// MIGRATION 1: create_onboarding_invites_table.php
// ============================================
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_invites', function (Blueprint $table) {
            $table->id();

            // Candidate Information
            $table->string('email')->unique(); // Personal email
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('position')->nullable(); // Hired position
            $table->string('department')->nullable();

            // Guest Access
            $table->string('token')->unique(); // Unique guest link token
            $table->timestamp('expires_at')->nullable(); // Link expiration

            // Status
            $table->enum('status', [
                'pending',      // Sent, waiting for submission
                'in_progress',  // Candidate started filling
                'submitted',    // Candidate completed submission
                'approved',     // HR approved, account created
                'expired',      // Link expired
                'cancelled',     // HR cancelled invite
            ])->default('pending');

            // Metadata
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // HR who sent invite
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('converted_user_id')->nullable()->constrained('users')->onDelete('set null'); // Created user account

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('token');
            $table->index('status');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_invites');
    }
};
