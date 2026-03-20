<?php

namespace App\Services\Onboarding;

use App\Models\OnboardingDocument;
use App\Models\OnboardingSubmission;
use App\Services\DocumentAuditService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OnboardingDocumentService
{
    public function __construct(private DocumentAuditService $auditService)
    {
    }
    /**
     * Upload a new document for submission
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

        // Mark invite as in progress
        $submission->invite->markAsInProgress();

        // 📝 AUDIT LOG: Record upload action (non-blocking)
        try {
            $this->auditService->logAccess($document, 'upload', null, [
                'original_filename' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getClientMimeType(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log document upload', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $document;
    }

    /**
     * Replace an existing document with a new file
     */
    public function replaceDocument(OnboardingDocument $document, UploadedFile $newFile): OnboardingDocument
    {
        $oldFilename = $document->filename;

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

        // 📝 AUDIT LOG: Record replace action (non-blocking)
        try {
            $this->auditService->logAccess($document, 'replace', null, [
                'old_filename' => $oldFilename,
                'new_filename' => $newFile->getClientOriginalName(),
                'new_file_size' => $newFile->getSize(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log document replacement', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $document;
    }

    /**
     * Delete a document and its file
     */
    public function deleteDocument(OnboardingDocument $document): bool
    {
        // 📝 AUDIT LOG: Record delete action BEFORE deletion (non-blocking)
        try {
            $this->auditService->logAccess($document, 'delete', null, [
                'deleted_filename' => $document->filename,
                'document_type' => $document->document_type,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log document deletion', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Delete physical file
        $document->deleteFile();

        // Delete database record
        $document->delete();

        return true;
    }

    /**
     * Approve a document
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
     * @return int Number of documents approved
     *
     * @throws \Exception
     */
    public function bulkApproveDocuments(OnboardingSubmission $submission): int
    {
        return DB::transaction(function () use ($submission) {
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
            ->filter(fn ($doc) => $doc['required']);
    }

    /**
     * Get only optional document types
     *
     * @return \Illuminate\Support\Collection
     */
    public function getOptionalOnly()
    {
        return collect(config('onboarding.document_types'))
            ->filter(fn ($doc) => ! $doc['required']);
    }

    /**
     * Get configuration for specific document type
     */
    public function getDocumentConfig(string $type): ?array
    {
        return config("onboarding.document_types.{$type}");
    }

    /**
     * Check if document type is required
     */
    public function isRequired(string $type): bool
    {
        return config("onboarding.document_types.{$type}.required", false);
    }

}
