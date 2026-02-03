<?php

namespace App\Services\Onboarding;

use App\Models\OnboardingDocument;
use App\Models\OnboardingSubmission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OnboardingDocumentService
{
    /**
     * Upload a new document for submission
     *
     * @param OnboardingSubmission $submission
     * @param UploadedFile $file
     * @param string $documentType
     * @param string|null $description
     * @return OnboardingDocument
     */
    public function uploadDocument(
        OnboardingSubmission $submission,
        UploadedFile $file,
        string $documentType,
        ?string $description = null
    ): OnboardingDocument {
        $path = $file->store('onboarding-documents', 'private');

        $document = OnboardingDocument::create([
            'submission_id' => $submission->id,
            'document_type' => $documentType,
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'description' => $description,
            'status' => OnboardingDocument::STATUS_UPLOADED,
        ]);

        // Update submission completion percentage
        // Use event or direct call to avoid circular dependency
        $this->updateSubmissionCompletion($submission);

        // Mark invite as in progress
        $submission->invite->markAsInProgress();

        return $document;
    }

    /**
     * Replace an existing document with a new file
     *
     * @param OnboardingDocument $document
     * @param UploadedFile $newFile
     * @return OnboardingDocument
     */
    public function replaceDocument(OnboardingDocument $document, UploadedFile $newFile): OnboardingDocument
    {
        // Delete old file
        $document->deleteFile();

        // Store new file
        $path = $newFile->store('onboarding-documents', 'private');

        // Update document record
        $document->update([
            'filename' => $newFile->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $newFile->getClientMimeType(),
            'size' => $newFile->getSize(),
            'status' => OnboardingDocument::STATUS_UPLOADED,
            'rejection_reason' => null,
            'verified_at' => null,
            'verified_by' => null,
        ]);

        return $document;
    }

    /**
     * Delete a document and its file
     *
     * @param OnboardingDocument $document
     * @return bool
     */
    public function deleteDocument(OnboardingDocument $document): bool
    {
        $submission = $document->submission;

        // Delete physical file
        $document->deleteFile();

        // Delete database record
        $document->delete();

        // Update submission completion
        $this->updateSubmissionCompletion($submission);

        return true;
    }

    /**
     * Approve a document
     *
     * @param OnboardingDocument $document
     * @return OnboardingDocument
     */
    public function approveDocument(OnboardingDocument $document): OnboardingDocument
    {
        $document->update([
            'status' => OnboardingDocument::STATUS_APPROVED,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => null,
        ]);

        // TODO: Send notification to candidate
        // Consider using events: DocumentApproved::dispatch($document)

        return $document;
    }

    /**
     * Reject a document with reason
     *
     * @param OnboardingDocument $document
     * @param string $reason
     * @return OnboardingDocument
     */
    public function rejectDocument(OnboardingDocument $document, string $reason): OnboardingDocument
    {
        $document->update([
            'status' => OnboardingDocument::STATUS_REJECTED,
            'rejection_reason' => $reason,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        // TODO: Send notification to candidate
        // Consider using events: DocumentRejected::dispatch($document, $reason)

        return $document;
    }

    /**
     * Bulk approve all uploaded documents for a submission
     *
     * Note: This method is kept for backward compatibility but bulk update
     * should be done directly in controller for better performance.
     *
     * @param OnboardingSubmission $submission
     * @return int Number of documents approved
     * @throws \Exception
     */
    public function bulkApproveDocuments(OnboardingSubmission $submission): int
    {
        return DB::transaction(function() use ($submission) {
            $count = $submission->documents()
                ->where('status', OnboardingDocument::STATUS_UPLOADED)
                ->count();

            if ($count === 0) {
                throw new \Exception('No documents waiting for approval.');
            }

            // Bulk update - single query
            $submission->documents()
                ->where('status', OnboardingDocument::STATUS_UPLOADED)
                ->update([
                    'status' => OnboardingDocument::STATUS_APPROVED,
                    'verified_at' => now(),
                    'verified_by' => auth()->id(),
                    'rejection_reason' => null,
                ]);

            return $count;
        });

        // TODO: Send notification to candidate
        // Consider using events: DocumentsBulkApproved::dispatch($submission, $count)
    }

    /**
     * Get all document types from config
     *
     * @return array
     */
    public function getRequiredDocumentTypes(): array
    {
        return config('onboarding.document_types');
    }

    /**
     * Get only required document types
     *
     * @return \Illuminate\Support\Collection
     */
    public function getRequiredOnly()
    {
        return collect(config('onboarding.document_types'))
            ->filter(fn($doc) => $doc['required']);
    }

    /**
     * Get only optional document types
     *
     * @return \Illuminate\Support\Collection
     */
    public function getOptionalOnly()
    {
        return collect(config('onboarding.document_types'))
            ->filter(fn($doc) => !$doc['required']);
    }

    /**
     * Get configuration for specific document type
     *
     * @param string $type
     * @return array|null
     */
    public function getDocumentConfig(string $type): ?array
    {
        return config("onboarding.document_types.{$type}");
    }

    /**
     * Check if document type is required
     *
     * @param string $type
     * @return bool
     */
    public function isRequired(string $type): bool
    {
        return config("onboarding.document_types.{$type}.required", false);
    }

    /**
     * Update submission completion percentage
     *
     * This method is extracted to avoid circular dependency.
     * Alternative: Use events (DocumentUploaded, DocumentDeleted)
     *
     * @param OnboardingSubmission $submission
     * @return void
     */
    protected function updateSubmissionCompletion(OnboardingSubmission $submission): void
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
    }

    /**
     * Check if submission has all required documents approved
     *
     * @param OnboardingSubmission $submission
     * @return bool
     */
    protected function hasRequiredDocuments(OnboardingSubmission $submission): bool
    {
        $requiredTypes = $this->getRequiredOnly()->keys();

        $approvedTypes = $submission->documents()
            ->where('status', OnboardingDocument::STATUS_APPROVED)
            ->pluck('document_type')
            ->unique();

        return $requiredTypes->diff($approvedTypes)->isEmpty();
    }
}
