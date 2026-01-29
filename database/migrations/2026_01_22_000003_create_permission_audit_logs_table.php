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
        Schema::create('permission_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Affected user
            $table->foreignId('permission_id')->constrained()->onDelete('cascade'); // Which permission
            $table->enum('action', [
                'granted',
                'revoked',
                'override_removed',
                'role_permission_added',
                'role_permission_removed',
            ]); // What happened
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade'); // Who made the change
            $table->json('context')->nullable(); // Additional details (role_id, reason, etc.)
            $table->timestamp('created_at')->useCurrent(); // When it happened

            // Indexes for common queries
            $table->index('user_id');
            $table->index('permission_id');
            $table->index('actor_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_audit_logs');
    }
};
