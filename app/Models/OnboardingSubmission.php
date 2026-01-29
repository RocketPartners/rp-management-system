<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OnboardingSubmission extends Model
{
    use HasFactory, SoftDeletes;

    // ============================================
    // CONSTANTS
    // ============================================

    const STATUS_DRAFT = 'draft';

    const STATUS_APPROVED = 'approved';

    // ============================================
    // MODEL CONFIGURATION
    // ============================================

    protected $fillable = [
        'invite_id',
        'personal_info',
        'government_ids',
        'emergency_contact',
        'additional_info',
        'completion_percentage',
        'completed_sections',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'hr_notes',
        'revision_notes',
    ];

    protected $casts = [
        'personal_info' => 'array',
        'government_ids' => 'array',
        'emergency_contact' => 'array',
        'additional_info' => 'array',
        'completed_sections' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => self::STATUS_DRAFT,
        'completion_percentage' => 0,
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function invite()
    {
        return $this->belongsTo(OnboardingInvite::class, 'invite_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function documents()
    {
        return $this->hasMany(OnboardingDocument::class, 'submission_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    // ============================================
    // STATE CHECKS (Simple boolean checks only)
    // ============================================

    /**
     * Check if submission can be edited (only drafts)
     */
    public function canBeEdited(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Check if submission is locked (opposite of canBeEdited)
     */
    public function isLocked(): bool
    {
        return ! $this->canBeEdited();
    }

    /**
     * Check if form sections are complete (100%)
     */
    public function isComplete(): bool
    {
        return $this->completion_percentage >= 100;
    }

    /**
     * Check if submission is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if submission is draft
     */
    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    // ============================================
    // SUBMISSION VALIDATION (Optimized - Single Query)
    // ============================================

    /**
     * Get comprehensive submission status with single database query
     *
     * Returns array with:
     * - can_submit: bool - Whether submission can be finalized
     * - blocker: string|null - Reason why submission is blocked (if blocked)
     * - missing_documents: array - List of missing required documents
     */
    public function getSubmissionStatus(): array
    {
        // Check if form sections are complete
        if (! $this->isComplete()) {
            return [
                'can_submit' => false,
                'blocker' => 'Please complete all form sections.',
                'missing_documents' => [],
            ];
        }

        // Get required document types from config
        $requiredTypes = collect(config('onboarding.document_types'))
            ->filter(fn ($doc) => $doc['required']);

        // Single query - get all approved document types for this submission
        $approvedTypes = $this->documents()
            ->where('status', OnboardingDocument::STATUS_APPROVED)
            ->pluck('document_type');

        // Find missing required documents
        $missing = $requiredTypes
            ->keys()
            ->diff($approvedTypes)
            ->map(fn ($type) => $requiredTypes[$type]['label'])
            ->values()
            ->toArray();

        return [
            'can_submit' => empty($missing),
            'blocker' => empty($missing)
                ? null
                : 'Waiting for HR to approve: '.implode(', ', $missing),
            'missing_documents' => $missing,
        ];
    }

    /**
     * Check if submission can be finalized
     */
    public function canSubmit(): bool
    {
        return $this->getSubmissionStatus()['can_submit'];
    }

    /**
     * Get reason why submission is blocked (if applicable)
     */
    public function getSubmitBlockerMessage(): ?string
    {
        return $this->getSubmissionStatus()['blocker'];
    }

    // ============================================
    // ACCESSORS (Read-only computed properties)
    // ============================================

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_DRAFT => 'In progress',
            self::STATUS_APPROVED => 'Completed',
            default => 'Unknown',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_DRAFT => 'blue',
            self::STATUS_APPROVED => 'green',
            default => 'gray',
        };
    }
}
