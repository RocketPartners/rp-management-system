<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// ============================================
// MIGRATION 3: create_onboarding_documents_table.php
// ============================================
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('onboarding_submissions')->onDelete('cascade');

            // Document Information
            $table->enum('document_type', [
                'resume',
                'government_id',         // Any government ID
                'sss_id',
                'tin_id',
                'philhealth_id',
                'hdmf_pagibig_id',
                'birth_certificate',
                'nbi_clearance',
                'pnp_clearance',
                'medical_certificate',
                'diploma',
                'transcript',
                'previous_employment_coe', // Certificate of Employment
                'other',
            ]);

            $table->string('filename');          // Original filename
            $table->string('path');              // Storage path
            $table->string('mime_type');         // File type
            $table->integer('size');             // File size in bytes
            $table->text('description')->nullable(); // Optional notes

            // Verification Status
            $table->enum('status', [
                'uploaded',    // Candidate uploaded (replaces 'draft')
                'approved',    // HR verified
                'rejected',    // HR rejected - needs reupload
            ])->default('uploaded');

            $table->text('rejection_reason')->nullable(); // Why rejected
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('submission_id');
            $table->index('document_type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_documents');
    }
};
