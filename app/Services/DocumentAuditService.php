<?php

namespace App\Services;

use App\Models\DocumentAccessLog;
use App\Models\OnboardingDocument;
use App\Models\User;

class DocumentAuditService
{
    /**
     * Log document access
     */
    public function logAccess(
        OnboardingDocument $document,
        string $action,
        ?User $user = null,
        array $context = []
    ): DocumentAccessLog {
        return DocumentAccessLog::create([
            'user_id' => $user?->id ?? auth()->id(),
            'document_id' => $document->id,
            'action' => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'context' => array_merge([
                'document_type' => $document->document_type,
                'submission_id' => $document->submission_id,
                'filename' => $document->filename,
            ], $context),
            'accessed_at' => now(),
        ]);
    }

    /**
     * Get document access history
     */
    public function getDocumentAccessHistory(OnboardingDocument $document, int $days = 90)
    {
        return DocumentAccessLog::forDocument($document->id)
            ->with('user')
            ->recent($days)
            ->orderBy('accessed_at', 'desc')
            ->get();
    }

    /**
     * Get user access history
     */
    public function getUserAccessHistory(User $user, int $days = 90)
    {
        return DocumentAccessLog::forUser($user->id)
            ->with('document.submission.invite')
            ->recent($days)
            ->orderBy('accessed_at', 'desc')
            ->get();
    }

    /**
     * Place legal hold on a document
     */
    public function placeLegalHold(OnboardingDocument $document, string $reason): void
    {
        $document->update([
            'legal_hold' => true,
            'legal_hold_reason' => $reason,
            'legal_hold_placed_at' => now(),
            'legal_hold_placed_by' => auth()->id(),
        ]);

        $this->logAccess($document, 'legal_hold_placed', null, [
            'reason' => $reason,
        ]);
    }

    /**
     * Remove legal hold from a document
     */
    public function removeLegalHold(OnboardingDocument $document): void
    {
        $document->update([
            'legal_hold' => false,
            'legal_hold_reason' => null,
            'legal_hold_placed_at' => null,
            'legal_hold_placed_by' => null,
        ]);

        $this->logAccess($document, 'legal_hold_removed');
    }
}
