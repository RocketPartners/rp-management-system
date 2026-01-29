<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Number;

class OnboardingDocument extends Model
{
    use HasFactory, SoftDeletes;

    // ============================================
    // CONSTANTS
    // ============================================

    const STATUS_UPLOADED = 'uploaded';

    const STATUS_APPROVED = 'approved';

    const STATUS_REJECTED = 'rejected';

    // ============================================
    // MODEL CONFIGURATION
    // ============================================

    protected $fillable = [
        'submission_id',
        'document_type',
        'filename',
        'path',
        'mime_type',
        'size',
        'description',
        'status',
        'rejection_reason',
        'verified_at',
        'verified_by',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => self::STATUS_UPLOADED,
    ];

    // ============================================
    // BOOT METHOD - LIFECYCLE HOOKS
    // ============================================

    protected static function boot()
    {
        parent::boot();

        // Clean up files when document is deleted
        static::deleting(function ($document) {
            if ($document->isForceDeleting()) {
                // Permanently deleting - remove file from storage
                $document->deleteFile();
            }
            // For soft deletes, keep file for potential recovery
        });

        // Ensure file cleanup on force delete
        static::forceDeleting(function ($document) {
            $document->deleteFile();
        });
    }

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function submission()
    {
        return $this->belongsTo(OnboardingSubmission::class, 'submission_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeUploaded($query)
    {
        return $query->where('status', self::STATUS_UPLOADED);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    // ============================================
    // ACCESSORS (Read-only computed properties)
    // ============================================

    /**
     * Get human-readable file size using Laravel's Number helper
     */
    public function getFileSizeAttribute()
    {
        return Number::fileSize($this->size);
    }

    public function getDocumentTypeLabelAttribute()
    {
        return match ($this->document_type) {
            'resume' => 'Resume / CV',
            'government_id' => 'Government ID',
            'nbi_clearance' => 'NBI Clearance',
            'pnp_clearance' => 'PNP Clearance',
            'medical_certificate' => 'Medical Certificate',
            'sss_id' => 'SSS ID',
            'tin_id' => 'TIN ID',
            'philhealth_id' => 'PhilHealth ID',
            'hdmf_pagibig_id' => 'HDMF / Pag-IBIG ID',
            'birth_certificate' => 'Birth Certificate',
            'diploma' => 'Diploma',
            'transcript' => 'Transcript of Records',
            'previous_employment_coe' => 'Certificate of Employment',
            default => ucwords(str_replace('_', ' ', $this->document_type)),
        };
    }

    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
            self::STATUS_UPLOADED => 'Uploaded',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_REJECTED => 'Rejected',
            default => 'Unknown',
        };
    }

    // ============================================
    // STATE CHECKS (Simple boolean checks only)
    // ============================================

    /**
     * Check if document is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if document is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if document is uploaded (pending review)
     */
    public function isUploaded(): bool
    {
        return $this->status === self::STATUS_UPLOADED;
    }

    /**
     * Check if this is an image file
     */
    public function isImage(): bool
    {
        return in_array($this->mime_type, [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        ]);
    }

    /**
     * Check if this is a PDF file
     */
    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    // ============================================
    // FILE OPERATIONS
    // ============================================

    /**
     * Delete the physical file from storage
     */
    public function deleteFile(): void
    {
        if ($this->path && Storage::exists($this->path)) {
            Storage::delete($this->path);
        }
    }
}
