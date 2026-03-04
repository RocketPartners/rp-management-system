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
        Schema::create('document_access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('document_id')->constrained('onboarding_documents')->cascadeOnDelete();
            $table->enum('action', ['view', 'download', 'delete', 'upload', 'replace']);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('context')->nullable(); // Extra metadata (document_type, submission_id)
            $table->timestamp('accessed_at');
            $table->timestamp('created_at')->nullable(); // When log was created (for debugging)
            // Note: No updated_at column - logs are immutable

            // Indexes for performance
            $table->index('user_id');
            $table->index('document_id');
            $table->index('accessed_at');
            $table->index(['user_id', 'accessed_at']); // User activity queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_access_logs');
    }
};
