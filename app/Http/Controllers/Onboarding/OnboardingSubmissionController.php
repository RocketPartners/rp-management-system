<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Resources\OnboardingChecklistResource;
use App\Models\OnboardingDocument;
use App\Models\OnboardingSubmission;
use App\Services\Onboarding\OnboardingDocumentService;
use App\Services\Onboarding\OnboardingSubmissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OnboardingSubmissionController extends Controller
{
    protected $submissionService;

    protected $documentService;

    public function __construct(
        OnboardingSubmissionService $submissionService,
        OnboardingDocumentService $documentService
    ) {
        $this->submissionService = $submissionService;
        $this->documentService = $documentService;
    }

    /**
     * Display all submissions for HR review
     */
    public function index(Request $request)
    {
        // Policy authorization - automatically checks with OnboardingSubmissionPolicy
        $this->authorize('viewAny', OnboardingSubmission::class);

        // Build query with eager loading (prevent N+1)
        $query = OnboardingSubmission::with(['invite', 'documents', 'reviewer']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by candidate email/name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('invite', function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $submissions = $query->latest()->paginate(15)->withQueryString();

        // Get stats (consider caching these for better performance)
        $stats = [
            'total' => OnboardingSubmission::count(),
            'draft' => OnboardingSubmission::draft()->count(),
            'approved' => OnboardingSubmission::approved()->count(),
        ];

        return Inertia::render('Admin/Onboarding/Submissions/Index', [
            'submissions' => $submissions,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Review a specific submission
     */
    public function review(OnboardingSubmission $submission)
    {
        // Policy authorization
        $this->authorize('review', $submission);

        // Eager load relationships to prevent N+1 queries
        $submission->load([
            'invite',
            'documents',
            'reviewer',
        ]);

        // Transform documents for frontend
        $submission->documents->each(function ($doc) {
            // These accessors are already defined in model
            $doc->append(['file_size', 'document_type_label']);

            // Add URLs (consider moving to API Resource)
            $doc->download_url = route('onboarding.submissions.download-document', $doc->id);
            $doc->view_url = route('onboarding.submissions.view-document', $doc->id);
        });

        $checklist = new OnboardingChecklistResource($submission);

        return Inertia::render('Admin/Onboarding/Submissions/Review', [
            'submission' => $submission,
            'checklist' => $checklist,
        ]);
    }

    /**
     * Approve a document
     */
    public function approveDocument(OnboardingDocument $document)
    {
        // Policy authorization
        $this->authorize('approveDocument', OnboardingSubmission::class);

        try {
            $this->documentService->approveDocument($document);

            return back()->with('success', 'Document approved!');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Bulk approve all uploaded documents
     * Note: This does NOT finalize the submission
     * Cannot approve if any documents are rejected (they need to be reuploaded first)
     */
    public function approve(Request $request, OnboardingSubmission $submission)
    {
        // Policy authorization
        $this->authorize('approveDocument', OnboardingSubmission::class);

        try {
            $count = DB::transaction(function () use ($submission) {
                $totalDocs = $submission->documents()->count();
                $uploadedCount = $submission->documents()
                    ->where('status', OnboardingDocument::STATUS_UPLOADED)
                    ->count();
                $approvedCount = $submission->documents()
                    ->where('status', OnboardingDocument::STATUS_APPROVED)
                    ->count();
                $rejectedCount = $submission->documents()
                    ->where('status', OnboardingDocument::STATUS_REJECTED)
                    ->count();

                // Validation
                if ($totalDocs === 0) {
                    throw new \Exception('No documents have been uploaded yet.');
                }

                if ($rejectedCount > 0) {
                    throw new \Exception("Cannot approve all documents. {$rejectedCount} document(s) are rejected and need to be reuploaded first.");
                }

                if ($uploadedCount === 0) {
                    if ($approvedCount === $totalDocs) {
                        throw new \Exception('All documents are already approved.');
                    }
                    throw new \Exception('No documents waiting for approval.');
                }

                // Bulk approve all uploaded documents
                $submission->documents()
                    ->where('status', OnboardingDocument::STATUS_UPLOADED)
                    ->update([
                        'status' => OnboardingDocument::STATUS_APPROVED,
                        'verified_at' => now(),
                        'verified_by' => auth()->id(),
                        'rejection_reason' => null,
                    ]);

                return $uploadedCount;
            });

            return back()->with('success', "Successfully approved {$count} document(s).");

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Bulk reject all documents and request revisions
     * This rejects all uploaded/approved documents so candidate can reupload
     */
    public function reject(Request $request, OnboardingSubmission $submission)
    {
        // Policy authorization
        $this->authorize('approveDocument', OnboardingSubmission::class);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        try {
            $count = DB::transaction(function () use ($submission, $validated) {
                // Count documents that can be rejected (uploaded or approved)
                $count = $submission->documents()
                    ->whereIn('status', [
                        OnboardingDocument::STATUS_UPLOADED,
                        OnboardingDocument::STATUS_APPROVED,
                    ])
                    ->count();

                if ($count === 0) {
                    throw new \Exception('No documents to reject. All documents may already be rejected.');
                }

                // Bulk reject all uploaded/approved documents
                $submission->documents()
                    ->whereIn('status', [
                        OnboardingDocument::STATUS_UPLOADED,
                        OnboardingDocument::STATUS_APPROVED,
                    ])
                    ->update([
                        'status' => OnboardingDocument::STATUS_REJECTED,
                        'rejection_reason' => $validated['rejection_reason'],
                        'verified_at' => now(),
                        'verified_by' => auth()->id(),
                    ]);

                // Add HR notes to submission for tracking
                $submission->update([
                    'hr_notes' => 'Revisions requested: '.$validated['rejection_reason'],
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                ]);

                return $count;
            });

            // TODO: Send notification email to candidate
            // Notify::send($submission->invite, new DocumentsRejected($submission));

            return back()->with('success', "Rejected {$count} document(s). Candidate will be notified to reupload.");

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject a document
     */
    public function rejectDocument(Request $request, OnboardingDocument $document)
    {
        // Policy authorization
        $this->authorize('approveDocument', OnboardingSubmission::class);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        try {
            $this->documentService->rejectDocument($document, $validated['rejection_reason']);

            return back()->with('success', 'Document rejected. Candidate will be notified.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
