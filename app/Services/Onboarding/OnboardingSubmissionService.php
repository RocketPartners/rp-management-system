<?php

namespace App\Services\Onboarding;

use App\Models\OnboardingSubmission;
use App\Models\OnboardingDocument;
use Illuminate\Support\Facades\DB;

class OnboardingSubmissionService
{
    protected $documentService;

    public function __construct(OnboardingDocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    // ============================================
    // UPDATE SECTIONS
    // ============================================

    /**
     * Update personal information section
     *
     * @param OnboardingSubmission $submission
     * @param array $data
     * @return OnboardingSubmission
     */
    public function updatePersonalInfo(OnboardingSubmission $submission, array $data): OnboardingSubmission
    {
        $submission->update(['personal_info' => $data]);
        $this->markSectionComplete($submission, 'personal_info');
        return $submission;
    }

    /**
     * Update government IDs section
     *
     * @param OnboardingSubmission $submission
     * @param array $data
     * @return OnboardingSubmission
     */
    public function updateGovernmentIds(OnboardingSubmission $submission, array $data): OnboardingSubmission
    {
        $submission->update(['government_ids' => $data]);
        $this->markSectionComplete($submission, 'government_ids');
        return $submission;
    }

    /**
     * Update emergency contact section
     *
     * @param OnboardingSubmission $submission
     * @param array $data
     * @return OnboardingSubmission
     */
    public function updateEmergencyContact(OnboardingSubmission $submission, array $data): OnboardingSubmission
    {
        $submission->update(['emergency_contact' => $data]);
        $this->markSectionComplete($submission, 'emergency_contact');
        return $submission;
    }

    // ============================================
    // COMPLETION TRACKING
    // ============================================

    /**
     * Calculate completion percentage for submission
     *
     * @param OnboardingSubmission $submission
     * @return int
     */
    public function calculateCompletion(OnboardingSubmission $submission): int
    {
        $weights = config('onboarding.completion_weights');

        $sections = [
            'personal_info' => $submission->personal_info ? $weights['personal_info'] : 0,
            'government_ids' => $submission->government_ids ? $weights['government_ids'] : 0,
            'emergency_contact' => $submission->emergency_contact ? $weights['emergency_contact'] : 0,
            'documents' => $this->hasRequiredDocuments($submission) ? $weights['documents'] : 0,
        ];

        $total = array_sum($sections);
        $submission->update(['completion_percentage' => $total]);

        return $total;
    }

    /**
     * Mark a section as complete
     *
     * @param OnboardingSubmission $submission
     * @param string $sectionName
     * @return void
     */
    private function markSectionComplete(OnboardingSubmission $submission, string $sectionName): void
    {
        $completed = $submission->completed_sections ?? [];

        if (!in_array($sectionName, $completed)) {
            $completed[] = $sectionName;
            $submission->update(['completed_sections' => $completed]);
        }

        $this->calculateCompletion($submission);
    }

    /**
     * Check if submission has all required documents approved
     *
     * @param OnboardingSubmission $submission
     * @return bool
     */
    private function hasRequiredDocuments(OnboardingSubmission $submission): bool
    {
        $requiredTypes = $this->documentService->getRequiredOnly()->keys();

        $approvedTypes = $submission->documents()
            ->where('status', OnboardingDocument::STATUS_APPROVED)
            ->pluck('document_type')
            ->unique();

        return $requiredTypes->diff($approvedTypes)->isEmpty();
    }

    // ============================================
    // SUBMISSION WORKFLOW
    // ============================================

    /**
     * Submit onboarding for review (candidate completes form)
     *
     * Note: This is different from finalizeOnboarding (HR approval)
     *
     * @param OnboardingSubmission $submission
     * @return OnboardingSubmission
     * @throws \Exception
     */
    public function submitOnboarding(OnboardingSubmission $submission): OnboardingSubmission
    {
        if (!$submission->canSubmit()) {
            throw new \Exception($submission->getSubmitBlockerMessage());
        }

        DB::transaction(function() use ($submission) {
            $submission->update([
                'submitted_at' => now(),
            ]);

            // Update invite status to 'submitted'
            $submission->invite->update([
                'status' => 'submitted'
            ]);
        });

        // TODO: Send notification to HR for review
        // Consider using events: SubmissionCompleted::dispatch($submission)

        return $submission;
    }

    /**
     * Finalize onboarding (HR approves submission)
     *
     * @param OnboardingSubmission $submission
     * @param string|null $hrNotes
     * @return OnboardingSubmission
     * @throws \Exception
     */
    public function finalizeOnboarding(OnboardingSubmission $submission, ?string $hrNotes = null): OnboardingSubmission
    {
        if (!$submission->canSubmit()) {
            throw new \Exception($submission->getSubmitBlockerMessage());
        }

        DB::transaction(function() use ($submission, $hrNotes) {
            $submission->update([
                'status' => OnboardingSubmission::STATUS_APPROVED,
                'submitted_at' => $submission->submitted_at ?? now(),
                'reviewed_at' => now(),
                'reviewed_by' => auth()->id(),
                'hr_notes' => $hrNotes,
            ]);

            $submission->invite->update([
                'status' => 'approved'
            ]);
        });

        // TODO: Send notification for account creation
        // Consider using events: SubmissionApproved::dispatch($submission)

        return $submission;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Get missing required documents for submission
     *
     * @param OnboardingSubmission $submission
     * @return array
     */
    public function getMissingDocuments(OnboardingSubmission $submission): array
    {
        $requiredTypes = $this->documentService->getRequiredOnly();

        $approvedTypes = $submission->documents()
            ->where('status', OnboardingDocument::STATUS_APPROVED)
            ->pluck('document_type')
            ->unique();

        $missing = [];
        foreach ($requiredTypes as $type => $config) {
            if (!$approvedTypes->contains($type)) {
                $missing[$type] = $config['label'];
            }
        }

        return $missing;
    }


    // ============================================
    // USER CONVERSION
    // ============================================

    /**
     * Convert submission to user array
     *
     * @param OnboardingSubmission $submission
     * @return array
     * @throws \Exception
     */
    public function toUserArray(OnboardingSubmission $submission): array
    {
        // Check if submission has been submitted by candidate
        if (!$submission->submitted_at) {
            throw new \Exception('Submission has not been submitted yet.');
        }

        // Check if all required documents are approved by HR
        $submissionStatus = $submission->getSubmissionStatus();
        if (!$submissionStatus['can_submit']) {
            throw new \Exception('All required documents must be approved before converting to user. Missing: ' . implode(', ', $submissionStatus['missing_documents']));
        }

        return array_merge(
            $this->mapPersonalInfo($submission),
            $this->mapContactInfo($submission),
            $this->mapAddressInfo($submission),
            $this->mapGovernmentIds($submission),
            $this->mapEmergencyContact($submission),
            $this->mapEmploymentInfo($submission),
            $this->mapSecurityInfo($submission)
        );
    }

    /**
     * Map personal information fields
     *
     * @param OnboardingSubmission $submission
     * @return array
     */
    private function mapPersonalInfo(OnboardingSubmission $submission): array
    {
        $personal = $submission->personal_info ?? [];

        return [
            'first_name' => $personal['first_name'] ?? null,
            'middle_name' => $personal['middle_name'] ?? null,
            'last_name' => $personal['last_name'] ?? null,
            'suffix' => ($personal['suffix'] ?? 'none') !== 'none' ? $personal['suffix'] : null,
            'name' => $this->buildFullName($personal),
            'birthday' => $personal['birthday'] ?? null,
            'gender' => $personal['gender'] ?? null,
            'civil_status' => $personal['civil_status'] ?? null,
        ];
    }

    /**
     * Map contact information fields
     *
     * @param OnboardingSubmission $submission
     * @return array
     */
    private function mapContactInfo(OnboardingSubmission $submission): array
    {
        $personal = $submission->personal_info ?? [];

        return [
            'email' => $this->generateWorkEmail(
                $personal['first_name'] ?? 'user',
                $personal['last_name'] ?? 'temp'
            ),
            'personal_email' => $submission->invite->email,
            'phone_number' => $personal['phone_number'] ?? null,
            'personal_mobile' => $personal['mobile_number'] ?? null,
        ];
    }

    /**
     * Map address information fields
     *
     * @param OnboardingSubmission $submission
     * @return array
     */
    private function mapAddressInfo(OnboardingSubmission $submission): array
    {
        $personal = $submission->personal_info ?? [];

        return [
            'address_line_1' => $personal['address_line_1'] ?? null,
            'address_line_2' => $personal['address_line_2'] ?? null,
            'city' => $personal['city'] ?? null,
            'state' => $personal['state'] ?? null,
            'postal_code' => $personal['postal_code'] ?? null,
            'country' => $personal['country'] ?? 'Philippines',
        ];
    }

    /**
     * Map government ID fields
     *
     * @param OnboardingSubmission $submission
     * @return array
     */
    private function mapGovernmentIds(OnboardingSubmission $submission): array
    {
        $govIds = $submission->government_ids ?? [];

        return [
            'sss_number' => $govIds['sss_number'] ?? null,
            'tin_number' => $govIds['tin_number'] ?? null,
            'hdmf_number' => $govIds['hdmf_number'] ?? null,
            'philhealth_number' => $govIds['philhealth_number'] ?? null,
        ];
    }

    /**
     * Map emergency contact fields
     *
     * @param OnboardingSubmission $submission
     * @return array
     */
    private function mapEmergencyContact(OnboardingSubmission $submission): array
    {
        $emergency = $submission->emergency_contact ?? [];

        return [
            'emergency_contact_name' => $emergency['name'] ?? null,
            'emergency_contact_phone' => $emergency['phone'] ?? null,
            'emergency_contact_mobile' => $emergency['mobile'] ?? null,
            'emergency_contact_relationship' => $emergency['relationship'] ?? null,
        ];
    }

    /**
     * Map employment information fields
     *
     * @param OnboardingSubmission $submission
     * @return array
     */
    private function mapEmploymentInfo(OnboardingSubmission $submission): array
    {
        return [
            'position' => $submission->invite->position,
            'department' => $submission->invite->department,
            'employment_status' => 'active',
            'account_status' => 'active',
        ];
    }

    /**
     * Map security/authentication fields
     *
     * @param OnboardingSubmission $submission
     * @return array
     */
    private function mapSecurityInfo(OnboardingSubmission $submission): array
    {
        return [
            'password' => bcrypt(config('onboarding.default_password')),
            'email_verified_at' => now(),
        ];
    }

    /**
     * Build full name from name parts
     *
     * @param array $personal
     * @return string
     */
    private function buildFullName(array $personal): string
    {
        return trim(implode(' ', array_filter([
            $personal['first_name'] ?? '',
            $personal['middle_name'] ?? '',
            $personal['last_name'] ?? '',
        ])));
    }

    /**
     * Generate work email from name parts
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

        // Extract first word only from first name (handles multiple names like "John Paul" -> "john")
        $firstNameWords = explode(' ', trim($firstName));
        $firstWord = $firstNameWords[0] ?? 'user';

        // Remove non-alphabetic characters and convert to lowercase
        $first = strtolower(preg_replace('/[^a-z]/i', '', $firstWord));
        $last = strtolower(preg_replace('/[^a-z]/i', '', trim($lastName)));

        // Replace placeholders
        $email = str_replace(['{first}', '{last}'], [$first, $last], $format);

        return "{$email}@{$domain}";
    }
}
