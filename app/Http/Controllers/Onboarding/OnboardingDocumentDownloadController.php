<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\OnboardingDocument;
use App\Services\DocumentAuditService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OnboardingDocumentDownloadController extends Controller
{
    public function __construct(private DocumentAuditService $auditService) {}

    /**
     * Download onboarding document (with permission check)
     */
    public function download(OnboardingDocument $document)
    {
        $user = auth()->user();

        // ✅ SECURITY CHECK: Only HR or the document owner can download
        $isHR = $user && $user->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count() > 0;
        $isOwner = $document->submission->invite->email === request()->user()?->email ?? false;

        if (! $isHR && ! $isOwner) {
            abort(403, 'Unauthorized access to this document.');
        }

        // Check if file exists
        if (! Storage::disk('private')->exists($document->path)) {
            abort(404, 'Document file not found.');
        }

        // 📝 AUDIT LOG: Record download action (non-blocking)
        try {
            $this->auditService->logAccess($document, 'download');
        } catch (\Exception $e) {
            Log::error('Failed to log document download', [
                'document_id' => $document->id,
                'user_id' => $user?->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Return file download
        return Storage::disk('private')->download(
            $document->path,
            $document->filename
        );
    }

    /**
     * View document inline (for PDFs/images)
     */
    public function view(OnboardingDocument $document)
    {
        $user = auth()->user();

        // Same security check
        $isHR = $user && $user->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count() > 0;
        $isOwner = $document->submission->invite->email === request()->user()?->email ?? false;

        if (! $isHR && ! $isOwner) {
            abort(403, 'Unauthorized access to this document.');
        }

        if (! Storage::disk('private')->exists($document->path)) {
            abort(404, 'Document file not found.');
        }

        // 📝 AUDIT LOG: Record view action (non-blocking)
        try {
            $this->auditService->logAccess($document, 'view');
        } catch (\Exception $e) {
            Log::error('Failed to log document view', [
                'document_id' => $document->id,
                'user_id' => $user?->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Return file for viewing (inline)
        return response()->file(
            Storage::disk('private')->path($document->path),
            [
                'Content-Type' => $document->mime_type,
                'Content-Disposition' => 'inline; filename="'.$document->filename.'"',
            ]
        );
    }
}
