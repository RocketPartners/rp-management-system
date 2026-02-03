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
        return !$this->canBeEdited();
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
     *
     * @return array
     */
    public function getSubmissionStatus(): array
    {
        // Get required document types from config
        $requiredTypes = collect(config('onboarding.document_types'))
            ->filter(fn($doc) => $doc['required']);

        // Single query - get all approved document types for this submission
        $approvedTypes = $this->documents()
            ->where('status', OnboardingDocument::STATUS_APPROVED)
            ->pluck('document_type');

        // Find missing required documents
        $missing = $requiredTypes
            ->keys()
            ->diff($approvedTypes)
            ->map(fn($type) => $requiredTypes[$type]['label'])
            ->values()
            ->toArray();

        return [
            'can_submit' => empty($missing),
            'blocker' => empty($missing)
                ? null
                : 'Waiting for HR to approve: ' . implode(', ', $missing),
            'missing_documents' => $missing,
        ];
    }

    /**
     * Check if submission can be finalized
     *
     * @return bool
     */
    public function canSubmit(): bool
    {
        return $this->getSubmissionStatus()['can_submit'];
    }

    /**
     * Get reason why submission is blocked (if applicable)
     *
     * @return string|null
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
        return match($this->status) {
            self::STATUS_DRAFT => 'In progress',
            self::STATUS_APPROVED => 'Completed',
            default => 'Unknown',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'blue',
            self::STATUS_APPROVED => 'green',
            default => 'gray',
        };
    }

    // ============================================
    // CONVERSION METHODS
    // ============================================

    /**
     * Convert submission data to User array for account creation
     *
     * @return array
     */
    public function toUserArray(): array
    {
        $personalInfo = $this->personal_info ?? [];
        $governmentIds = $this->government_ids ?? [];
        $emergencyContact = $this->emergency_contact ?? [];
        $additionalInfo = $this->additional_info ?? [];

        // Generate work email
        $workEmail = $this->generateWorkEmail(
            $personalInfo['first_name'] ?? '',
            $personalInfo['last_name'] ?? ''
        );

        // Build full name
        $nameParts = array_filter([
            $personalInfo['first_name'] ?? '',
            $personalInfo['middle_name'] ?? '',
            $personalInfo['last_name'] ?? '',
        ]);
        $fullName = implode(' ', $nameParts);

        // Add suffix if not 'none'
        if (!empty($personalInfo['suffix']) && $personalInfo['suffix'] !== 'none') {
            $fullName .= ' ' . $personalInfo['suffix'];
        }

        return [
            // Basic info
            'name' => $fullName,
            'first_name' => $personalInfo['first_name'] ?? null,
            'middle_name' => $personalInfo['middle_name'] ?? null,
            'last_name' => $personalInfo['last_name'] ?? null,
            'suffix' => ($personalInfo['suffix'] ?? 'none') !== 'none' ? $personalInfo['suffix'] : null,

            // Emails & contacts
            'email' => $workEmail, // Primary email is work email
            'work_email' => $workEmail,
            'personal_email' => $this->invite->email, // Original invite email
            'phone_number' => $personalInfo['contact_number'] ?? null,
            'personal_mobile' => $personalInfo['contact_number'] ?? null,

            // Personal details
            'gender' => $personalInfo['gender'] ?? null,
            'civil_status' => $personalInfo['civil_status'] ?? null,
            'birthday' => $personalInfo['birthday'] ?? null,

            // Address
            'address_line_1' => $personalInfo['address_line_1'] ?? null,
            'address_line_2' => $personalInfo['address_line_2'] ?? null,
            'city' => $personalInfo['city'] ?? null,
            'state' => $personalInfo['province'] ?? null,
            'postal_code' => $personalInfo['zip_code'] ?? null,
            'country' => 'Philippines', // Default

            // Emergency contact
            'emergency_contact_name' => $emergencyContact['name'] ?? null,
            'emergency_contact_phone' => $emergencyContact['phone'] ?? null,
            'emergency_contact_mobile' => $emergencyContact['mobile'] ?? null,
            'emergency_contact_relationship' => $emergencyContact['relationship'] ?? null,

            // Government IDs
            'sss_number' => $governmentIds['sss'] ?? null,
            'tin_number' => $governmentIds['tin'] ?? null,
            'hdmf_number' => $governmentIds['hdmf'] ?? null,
            'philhealth_number' => $governmentIds['philhealth'] ?? null,

            // Additional info
            'payroll_account' => $additionalInfo['payroll_account'] ?? null,

            // Employment info from invite
            'department' => $this->invite->department,
            'position' => $this->invite->position,
            'hire_date' => now(),
            'employment_status' => 'active',
            'employment_type' => 'full-time',
            'account_status' => 'active',

            // Password (temporary)
            'password' => bcrypt(config('onboarding.default_temp_password', 'ChangeMe123!')),
        ];
    }

    /**
     * Generate work email from name
     *
     * @param string $firstName
     * @param string $lastName
     * @return string
     */
    private function generateWorkEmail(string $firstName, string $lastName): string
    {
        // Check if using testing email (local environment)
        $useTesting = config('onboarding.work_email.use_testing_email');
        if ($useTesting) {
            $username = config('onboarding.work_email.username');
            $domain = config('onboarding.work_email.domain');
            return "{$username}@{$domain}";
        }

        $format = config('onboarding.work_email.format');
        $domain = config('onboarding.work_email.domain');

        // Extract first word only from first name
        $firstNameWords = explode(' ', trim($firstName));
        $firstWord = $firstNameWords[0] ?? 'user';

        $first = strtolower(preg_replace('/[^a-z]/i', '', $firstWord));
        $last = strtolower(preg_replace('/[^a-z]/i', '', trim($lastName)));

        $email = str_replace(['{first}', '{last}'], [$first, $last], $format);

        return "{$email}@{$domain}";
    }
}
