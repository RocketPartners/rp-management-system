<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transform OnboardingSubmission into a requirements checklist
 * for frontend display
 */
class OnboardingChecklistResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'personal_info' => $this->getPersonalInfoStatus(),
            'government_ids' => $this->getGovernmentIdsStatus(),
            'emergency_contact' => $this->getEmergencyContactStatus(),
            'documents' => $this->getDocumentsStatus(),
        ];
    }

    /**
     * Get personal information section status
     */
    private function getPersonalInfoStatus(): array
    {
        $completed = ! empty($this->personal_info);

        return [
            'label' => 'Personal Information',
            'section' => 'Personal Information',
            'completed' => $completed,
            'status' => $completed ? 'complete' : 'missing',
            'message' => $completed
                ? 'All personal details submitted'
                : 'Personal information not provided',
        ];
    }

    /**
     * Get government IDs section status
     */
    private function getGovernmentIdsStatus(): array
    {
        $completed = ! empty($this->government_ids);

        return [
            'label' => 'Government IDs',
            'section' => 'Government IDs',
            'completed' => $completed,
            'status' => $completed ? 'complete' : 'missing',
            'message' => $completed
                ? 'Government ID information provided'
                : 'Government IDs not provided',
        ];
    }

    /**
     * Get emergency contact section status
     */
    private function getEmergencyContactStatus(): array
    {
        $completed = ! empty($this->emergency_contact);

        return [
            'label' => 'Emergency Contact',
            'section' => 'Emergency Contact',
            'completed' => $completed,
            'status' => $completed ? 'complete' : 'missing',
            'message' => $completed
                ? 'Emergency contact information provided'
                : 'Emergency contact not provided',
        ];
    }

    /**
     * Get documents section status
     */
    private function getDocumentsStatus(): array
    {
        // Get submission status from model (business logic stays in model/service)
        $submissionStatus = $this->getSubmissionStatus();
        $hasAllDocuments = $submissionStatus['can_submit'] ||
                          empty($submissionStatus['missing_documents']);

        return [
            'label' => 'Required Documents',
            'section' => 'Required Documents',
            'completed' => $hasAllDocuments,
            'status' => $hasAllDocuments ? 'complete' : 'missing',
            'message' => $this->getDocumentsMessage($submissionStatus),
        ];
    }

    /**
     * Get message for documents section
     */
    private function getDocumentsMessage(array $submissionStatus): string
    {
        if (empty($submissionStatus['missing_documents'])) {
            // Count approved documents
            $approvedCount = $this->documents()
                ->where('status', 'approved')
                ->count();

            return "All required documents approved ({$approvedCount} files)";
        }

        $missingCount = count($submissionStatus['missing_documents']);

        return "{$missingCount} required document types need approval";
    }
}
